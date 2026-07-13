/// <reference types="vite/client" />

interface ImportMetaEnv {
    /** Base URL of the build backend. Empty means same-origin (dev proxy). */
    readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
