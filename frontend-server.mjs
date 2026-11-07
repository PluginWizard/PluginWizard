// Production server for the frontend container. No dependencies.
//
// - Serves the built app from ./dist, falling back to index.html for
//   react-router routes.
// - Never falls back under /plugin/: the backend fetches the plugin template
//   from there, so those files are served as-is or 404.
// - Forwards /api/* to the backend over the docker network, so the browser
//   only ever talks to this origin.
// - Redirects to https when the tunnel reports the original request was http.

import { createReadStream } from "node:fs"
import { stat } from "node:fs/promises"
import http from "node:http"
import path from "node:path"
import { fileURLToPath } from "node:url"

const PORT = Number(process.env.PORT ?? 3001)
const BACKEND_URL = new URL(process.env.BACKEND_URL ?? "http://backend:8080")
const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), "dist")
const INDEX_HTML = path.join(DIST, "index.html")

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".mp4": "video/mp4",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".jar": "application/java-archive",
    ".yml": "text/yaml; charset=utf-8",
    ".java": "text/plain; charset=utf-8",
    ".gradle": "text/plain; charset=utf-8",
    ".properties": "text/plain; charset=utf-8",
    ".bat": "text/plain; charset=utf-8",
    ".gitignore": "text/plain; charset=utf-8",
}

/** Resolve a URL path to a file inside dist, or null if it escapes dist. */
function resolveInDist(urlPath) {
    let decoded
    try {
        decoded = decodeURIComponent(urlPath)
    } catch {
        return null
    }
    const filePath = path.join(DIST, path.normalize(decoded))
    return filePath === DIST || filePath.startsWith(DIST + path.sep) ? filePath : null
}

async function fileStats(filePath) {
    try {
        const stats = await stat(filePath)
        return stats.isFile() ? stats : null
    } catch {
        return null
    }
}

/** Send a file, honouring a single byte Range (needed for video playback in Safari). */
function sendFile(req, res, filePath, stats, cacheControl) {
    const headers = {
        "Content-Type": MIME_TYPES[path.extname(filePath) || path.basename(filePath)] ?? "application/octet-stream",
        "Cache-Control": cacheControl,
        "Accept-Ranges": "bytes",
        "Last-Modified": stats.mtime.toUTCString(),
    }

    let start = 0
    let end = stats.size - 1
    let status = 200

    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? "")
    if (range && (range[1] || range[2])) {
        if (range[1]) {
            start = Number(range[1])
            end = range[2] ? Math.min(Number(range[2]), end) : end
        } else {
            start = Math.max(stats.size - Number(range[2]), 0)
        }
        if (start > end || start >= stats.size) {
            res.writeHead(416, { "Content-Range": `bytes */${stats.size}` })
            res.end()
            return
        }
        status = 206
        headers["Content-Range"] = `bytes ${start}-${end}/${stats.size}`
    }

    headers["Content-Length"] = end - start + 1
    res.writeHead(status, headers)
    if (req.method === "HEAD" || stats.size === 0) {
        res.end()
        return
    }
    createReadStream(filePath, { start, end }).pipe(res)
}

function sendNotFound(res) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" })
    res.end("Not found")
}

async function serveStatic(req, res, urlPath) {
    if (req.method !== "GET" && req.method !== "HEAD") {
        res.writeHead(405, { Allow: "GET, HEAD" })
        res.end()
        return
    }

    const filePath = resolveInDist(urlPath)
    if (!filePath) return sendNotFound(res)

    const stats = await fileStats(filePath)
    if (stats) {
        // Vite fingerprints everything under /assets/, so those never change.
        const cacheControl = urlPath.startsWith("/assets/")
            ? "public, max-age=31536000, immutable"
            : filePath === INDEX_HTML ? "no-cache" : "public, max-age=3600"
        return sendFile(req, res, filePath, stats, cacheControl)
    }

    if (urlPath === "/plugin" || urlPath.startsWith("/plugin/")) return sendNotFound(res)

    const indexStats = await fileStats(INDEX_HTML)
    if (!indexStats) return sendNotFound(res)
    sendFile(req, res, INDEX_HTML, indexStats, "no-cache")
}

function proxyToBackend(req, res) {
    const headers = { ...req.headers, host: BACKEND_URL.host }
    const upstream = http.request(
        {
            protocol: BACKEND_URL.protocol,
            hostname: BACKEND_URL.hostname,
            port: BACKEND_URL.port,
            method: req.method,
            path: req.url,
            headers,
        },
        (upstreamRes) => {
            res.writeHead(upstreamRes.statusCode ?? 502, upstreamRes.headers)
            upstreamRes.pipe(res)
        },
    )
    upstream.on("error", (error) => {
        console.error(`Proxy error for ${req.method} ${req.url}:`, error.message)
        if (!res.headersSent) {
            res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" })
        }
        res.end("Backend unavailable")
    })
    req.pipe(upstream)
}

const server = http.createServer((req, res) => {
    // The tunnel terminates TLS and reports the original scheme.
    if (req.headers["x-forwarded-proto"] === "http" && req.headers.host) {
        res.writeHead(308, { Location: `https://${req.headers.host}${req.url}` })
        res.end()
        return
    }

    const urlPath = new URL(req.url ?? "/", "http://localhost").pathname

    if (urlPath === "/api" || urlPath.startsWith("/api/")) {
        proxyToBackend(req, res)
        return
    }

    serveStatic(req, res, urlPath).catch((error) => {
        console.error(`Failed to serve ${urlPath}:`, error)
        if (!res.headersSent) res.writeHead(500)
        res.end()
    })
})

// Plugin builds can take minutes, so don't cut off slow requests.
server.requestTimeout = 0

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Frontend listening on :${PORT}, proxying /api to ${BACKEND_URL.origin}`)
})
