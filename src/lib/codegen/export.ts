import { zipSync, strToU8, strFromU8, type Zippable } from "fflate";
import { Project } from "../../types/types";

/* =================================================================
 * Plugin export
 * Bundles the generated Java code together with the gradle project
 * template served from /public/plugin into a downloadable .zip, and
 * (for the .jar) sends that bundle to the build backend which returns
 * the compiled artifact.
 * ============================================================== */

/**
 * Files that make up the gradle project template in /public/plugin.
 * Assets under public/ are served verbatim and are not processed by
 * Vite, so they cannot be discovered with import.meta.glob — the list
 * has to be maintained explicitly.
 */
const TEMPLATE_FILES = [
    ".gitignore",
    "build.gradle",
    "gradle.properties",
    "gradlew",
    "gradlew.bat",
    "settings.gradle",
    "gradle/wrapper/gradle-wrapper.jar",
    "gradle/wrapper/gradle-wrapper.properties",
    "src/main/resources/plugin.yml",
    "src/main/resources/config.yml",
    "src/main/java/net/kalbskinder/plugin/Plugin.java",
    "src/main/java/net/kalbskinder/plugin/UserPlugin.java",
] as const

const TEMPLATE_BASE = "/plugin"

// Template paths whose contents are replaced or patched during export.
const MAIN_CLASS_PATH = "src/main/java/net/kalbskinder/plugin/Plugin.java"
const USER_PLUGIN_PATH = "src/main/java/net/kalbskinder/plugin/UserPlugin.java"
const CONFIG_PATH = "src/main/resources/config.yml"
const BUILD_GRADLE_PATH = "build.gradle"
const PLUGIN_YML_PATH = "src/main/resources/plugin.yml"

// Root of the Java sources in the template. The two Java files live under the
// template package net.kalbskinder.plugin and are relocated into the project's
// own package during export.
const JAVA_SOURCE_ROOT = "src/main/java"

const DEFAULT_VERSION = "1.0.0"

// Base URL of the build backend. Empty by default so requests go to the
// same origin (dev uses the Vite proxy for /api). Configure via env for
// deployments where the backend lives on a different host.
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "")

export interface GeneratedCode {
    code: string
    config: string
}

export interface JarBuildResult {
    success: boolean
    jar?: Uint8Array
    errors: string[]
    buildTimeMs: number
}

/** Resolve the plugin version, falling back to a sensible default. */
function resolveVersion(project: Project): string {
    return project.version?.trim() || DEFAULT_VERSION
}

/** Produce a filesystem-safe base file name from the project name. */
export function projectBaseName(project: Project): string {
    const trimmed = project.name.trim()
    const base = trimmed.length > 0 ? trimmed : "pluginwizard-plugin"
    return base.replace(/[^a-zA-Z0-9-_ .]/g, "_")
}

async function fetchTemplateFile(relativePath: string): Promise<Uint8Array> {
    const response = await fetch(`${TEMPLATE_BASE}/${relativePath}`)
    if (!response.ok) {
        throw new Error(`Failed to load template file ${relativePath}: ${response.status} ${response.statusText}`)
    }
    const contentType = response.headers.get("Content-Type") ?? ""
    if (contentType.includes("text/html")) {
        throw new Error(`Failed to load template file ${relativePath}: server returned HTML (resource not found)`)
    }
    return new Uint8Array(await response.arrayBuffer())
}

/** The PascalCase Java class name for the plugin's main class. */
function mainClassName(project: Project): string {
    const pascal = project.name
        .replace(/[^A-Za-z0-9]+/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("")
    if (!pascal) return "Plugin"
    return /^[0-9]/.test(pascal) ? `Plugin${pascal}` : pascal
}

/** The Java package for the exported plugin: <groupId>.<name-segment>. */
function pluginPackage(project: Project): string {
    const segment = project.name.toLowerCase().replace(/[^a-z0-9]/g, "")
    const safeSegment = !segment ? "plugin" : /^[0-9]/.test(segment) ? `plugin${segment}` : segment
    return `${project.groupId}.${safeSegment}`
}

/** A plugin.yml-safe plugin name derived from the project name. */
function pluginYmlName(project: Project): string {
    const cleaned = project.name.trim().replace(/[^A-Za-z0-9_.-]+/g, "_").replace(/^_+|_+$/g, "")
    return cleaned || "Plugin"
}

/** Update the gradle group id and version to match the project. */
function patchBuildGradle(content: string, project: Project): string {
    return content
        .replace(/^group\s*=\s*['"].*['"]\s*$/m, `group = '${project.groupId}'`)
        .replace(/^version\s*=\s*['"].*['"]\s*$/m, `version = '${resolveVersion(project)}'`)
}

/** Rewrite the template package declaration to the project's package. */
function patchPackage(content: string, project: Project): string {
    return content.replace(/^package\s+net\.kalbskinder\.plugin\s*;/m, `package ${pluginPackage(project)};`)
}

/** Rewrite the main class source: package declaration and class name. */
function patchMainClass(content: string, project: Project): string {
    return patchPackage(content, project).replace(/\bclass\s+Plugin\b/, `class ${mainClassName(project)}`)
}

/** Rewrite the UserPlugin source: package declaration and main-class type reference. */
function patchUserPlugin(content: string, project: Project): string {
    return patchPackage(content, project).replace(/\bfinal\s+Plugin\s+plugin\b/, `final ${mainClassName(project)} plugin`)
}

/** Fill the placeholders in plugin.yml with the project metadata. */
function patchPluginYml(content: string, project: Project): string {
    return content
        .replace(/^name:.*$/m, `name: ${pluginYmlName(project)}`)
        .replace(/^main:.*$/m, `main: ${pluginPackage(project)}.${mainClassName(project)}`)
        .split("{{version}}").join(resolveVersion(project))
        .split("{{description}}").join(project.description ?? "")
        .split("{{author}}").join(project.author ?? "")
}

/**
 * Build the plugin project as a zip: the gradle template with the
 * generated sources injected and the project metadata applied.
 */
export async function buildPluginZip(project: Project, generated: GeneratedCode): Promise<Uint8Array> {
    const entries = await Promise.all(
        TEMPLATE_FILES.map(async (path) => [path, await fetchTemplateFile(path)] as const),
    )

    // The Java sources are relocated into the project's own package and the
    // main class is renamed after the project, so work out their destinations.
    const packageDir = `${JAVA_SOURCE_ROOT}/${pluginPackage(project).replace(/\./g, "/")}`
    const mainClassDest = `${packageDir}/${mainClassName(project)}.java`
    const userPluginDest = `${packageDir}/UserPlugin.java`

    const zip: Zippable = {}
    for (const [path, bytes] of entries) {
        // Skip the template Java sources; they are re-added below at their
        // relocated paths with the package and class name rewritten.
        if (path === MAIN_CLASS_PATH || path === USER_PLUGIN_PATH) continue
        zip[path] = bytes
    }

    // Relocate and rewrite the main class, and inject the generated UserPlugin.
    const mainClassTemplate = entries.find(([path]) => path === MAIN_CLASS_PATH)![1]
    zip[mainClassDest] = strToU8(patchMainClass(strFromU8(mainClassTemplate), project))
    zip[userPluginDest] = strToU8(patchUserPlugin(generated.code, project))
    zip[CONFIG_PATH] = strToU8(generated.config)

    // Apply project metadata to the template files.
    zip[BUILD_GRADLE_PATH] = strToU8(patchBuildGradle(strFromU8(zip[BUILD_GRADLE_PATH] as Uint8Array), project))
    zip[PLUGIN_YML_PATH] = strToU8(patchPluginYml(strFromU8(zip[PLUGIN_YML_PATH] as Uint8Array), project))

    return zipSync(zip, { level: 6 })
}

function base64ToU8(base64: string): Uint8Array {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
    }
    return bytes
}

/**
 * Ask the build backend to compile the plugin and return the resulting jar
 * (or the build errors). Only the generated code, the config, and the project
 * metadata are sent — the backend assembles them onto its own trusted copy of
 * the project template, so no files are uploaded from the client.
 */
export async function requestPluginJar(project: Project, generated: GeneratedCode): Promise<JarBuildResult> {
    const response = await fetch(`${API_BASE}/api/build/full`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            pluginName: project.name,
            groupId: project.groupId,
            version: resolveVersion(project),
            description: project.description ?? "",
            author: project.author ?? "",
            code: generated.code,
            config: generated.config,
        }),
    })

    if (!response.ok) {
        throw new Error(`Build request failed: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as {
        success: boolean
        jarBase64?: string | null
        errors?: string[]
        buildTimeMs?: number
    }

    return {
        success: data.success,
        jar: data.jarBase64 ? base64ToU8(data.jarBase64) : undefined,
        errors: data.errors ?? [],
        buildTimeMs: data.buildTimeMs ?? 0,
    }
}

/** Trigger a browser download for the given binary data. */
export function downloadBytes(data: Uint8Array, filename: string, mimeType: string): void {
    // Copy into a fresh ArrayBuffer-backed view so Blob gets a plain ArrayBuffer.
    const blob = new Blob([data.slice()], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
}
