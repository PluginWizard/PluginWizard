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
const MAIN_CLASS_TEMPLATE_PATH = "src/main/java/net/kalbskinder/plugin/Plugin.java"
const USER_PLUGIN_TEMPLATE_PATH = "src/main/java/net/kalbskinder/plugin/UserPlugin.java"
const CONFIG_PATH = "src/main/resources/config.yml"
const BUILD_GRADLE_PATH = "build.gradle"
const PLUGIN_YML_PATH = "src/main/resources/plugin.yml"

// The package and main-class name hard-coded in the template sources. They are
// rewritten to the project's own identity (group id + plugin name) on export.
const TEMPLATE_PACKAGE = "net.kalbskinder.plugin"
const TEMPLATE_MAIN_CLASS = "Plugin"

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

/** The plugin's Java identity, derived from the project name and group id. */
interface PluginNaming {
    /** PascalCase main-class name, e.g. "MyCoolPlugin". */
    className: string
    /** Fully-qualified package, e.g. "com.example.mycoolplugin". */
    packageName: string
    /** The package as a source directory, e.g. "com/example/mycoolplugin". */
    packagePath: string
    /** Path of the main class inside the project, e.g. ".../MyCoolPlugin.java". */
    mainClassPath: string
    /** Path of the user plugin inside the project. */
    userPluginPath: string
}

/** Strip a string down to a Java-identifier-safe segment (no leading digits). */
function sanitizeSegment(segment: string): string {
    return segment.replace(/[^A-Za-z0-9_]/g, "").replace(/^[0-9]+/, "")
}

/** Derive a PascalCase Java class name from a display name. */
function toClassName(name: string): string {
    const pascal = name
        .split(/[^A-Za-z0-9]+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("")
        .replace(/^[0-9]+/, "")
    return pascal || TEMPLATE_MAIN_CLASS
}

/** Derive a lowercase Java package segment from a display name. */
function toPackageSegment(name: string): string {
    const segment = name.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/^[0-9]+/, "")
    return segment || "plugin"
}

/** Resolve the plugin's Java identity (class name, package, source paths). */
function resolveNaming(project: Project): PluginNaming {
    const className = toClassName(project.name)
    const groupSegments = project.groupId
        .split(".")
        .map(sanitizeSegment)
        .filter((segment) => segment.length > 0)
    const packageName = [...groupSegments, toPackageSegment(project.name)].join(".")
    const packagePath = packageName.replace(/\./g, "/")
    return {
        className,
        packageName,
        packagePath,
        mainClassPath: `src/main/java/${packagePath}/${className}.java`,
        userPluginPath: `src/main/java/${packagePath}/UserPlugin.java`,
    }
}

/** Rewrite the main class template into the project's package and name. */
function patchMainClass(content: string, naming: PluginNaming): string {
    return content
        .replace(`package ${TEMPLATE_PACKAGE};`, `package ${naming.packageName};`)
        .replace(
            `class ${TEMPLATE_MAIN_CLASS} extends JavaPlugin`,
            `class ${naming.className} extends JavaPlugin`,
        )
}

/** Rewrite the user plugin into the project's package, updating its reference
 * to the main class type. */
function patchUserPlugin(content: string, naming: PluginNaming): string {
    return content
        .replace(`package ${TEMPLATE_PACKAGE};`, `package ${naming.packageName};`)
        .replace(
            `private final ${TEMPLATE_MAIN_CLASS} plugin;`,
            `private final ${naming.className} plugin;`,
        )
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

/** Update the gradle group id and version to match the project. */
function patchBuildGradle(content: string, project: Project): string {
    return content
        .replace(/^group\s*=\s*['"].*['"]\s*$/m, `group = '${project.groupId}'`)
        .replace(/^version\s*=\s*['"].*['"]\s*$/m, `version = '${resolveVersion(project)}'`)
}

/** Set the plugin name / main class and fill the {{...}} placeholders in
 * plugin.yml with the project metadata. */
function patchPluginYml(content: string, project: Project, naming: PluginNaming): string {
    return content
        .replace(/^name:.*$/m, `name: ${naming.className}`)
        .replace(/^main:.*$/m, `main: ${naming.packageName}.${naming.className}`)
        .split("{{version}}").join(resolveVersion(project))
        .split("{{description}}").join(project.description ?? "")
        .split("{{author}}").join(project.author ?? "")
}

/**
 * Build the plugin project as a zip: the gradle template with the
 * generated sources injected and the project metadata applied.
 */
export async function buildPluginZip(project: Project, generated: GeneratedCode): Promise<Uint8Array> {
    const naming = resolveNaming(project)

    const entries = await Promise.all(
        TEMPLATE_FILES.map(async (path) => [path, await fetchTemplateFile(path)] as const),
    )

    const zip: Zippable = {}
    for (const [path, bytes] of entries) {
        zip[path] = bytes
    }

    // Move the main class into the project's own package, rewriting its
    // package declaration and class name.
    const mainClassSource = strFromU8(zip[MAIN_CLASS_TEMPLATE_PATH] as Uint8Array)
    delete zip[MAIN_CLASS_TEMPLATE_PATH]
    zip[naming.mainClassPath] = strToU8(patchMainClass(mainClassSource, naming))

    // Inject the generated user plugin at the same package path, dropping the
    // template copy at the original path.
    delete zip[USER_PLUGIN_TEMPLATE_PATH]
    zip[naming.userPluginPath] = strToU8(patchUserPlugin(generated.code, naming))

    // Inject the generated config.
    zip[CONFIG_PATH] = strToU8(generated.config)

    // Apply project metadata to the template files.
    zip[BUILD_GRADLE_PATH] = strToU8(patchBuildGradle(strFromU8(zip[BUILD_GRADLE_PATH] as Uint8Array), project))
    zip[PLUGIN_YML_PATH] = strToU8(patchPluginYml(strFromU8(zip[PLUGIN_YML_PATH] as Uint8Array), project, naming))

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
