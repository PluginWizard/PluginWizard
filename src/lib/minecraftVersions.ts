export interface MinecraftVersion {
    version: string
    label?: string
}

/** The Minecraft (Paper) versions a plugin can be built against. */
export const MINECRAFT_VERSIONS: MinecraftVersion[] = [
    { version: "26.1" },
    { version: "26.1.2" },
    { version: "26.2" },
    { version: "26.3" },
    { version: "26.4", label: "BETA" },
]

export const DEFAULT_MINECRAFT_VERSION = "26.3"

/**
 * Return the given version if it is one of the supported versions, otherwise
 * the default. Anything stored in a project or imported from a file passes
 * through here before it can reach the build files.
 */
export function sanitizeMinecraftVersion(value: string | null | undefined): string {
    const trimmed = value?.trim()
    return MINECRAFT_VERSIONS.some((entry) => entry.version === trimmed) ? trimmed! : DEFAULT_MINECRAFT_VERSION
}
