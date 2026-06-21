import { Project } from "../../types/types"

/**
 * Where a user's projects are persisted in the browser.
 * - "indexeddb"    – preferred, larger capacity, can be made persistent
 * - "localstorage" – fallback when the user declines persistent storage
 */
export type StoragePreference = "indexeddb" | "localstorage"

const PREFERENCE_KEY = "pluginwizard:storage-preference"
const LOCALSTORAGE_PROJECTS_KEY = "pluginwizard:projects"
const DB_NAME = "pluginwizard"
const DB_VERSION = 1
const STORE_NAME = "projects"

export interface ProjectStore {
    /** Which backend this store is actually using. */
    readonly mode: StoragePreference
    getAll(): Promise<Project[]>
    get(id: string): Promise<Project | undefined>
    save(project: Project): Promise<void>
    remove(id: string): Promise<void>
}

/* ======================================
   Preference persistence
   ====================================== */

/** Returns the previously chosen storage backend, or null if the user has not decided yet. */
export function getStoragePreference(): StoragePreference | null {
    try {
        const value = localStorage.getItem(PREFERENCE_KEY)
        return value === "indexeddb" || value === "localstorage" ? value : null
    } catch {
        return null
    }
}

export function setStoragePreference(preference: StoragePreference): void {
    try {
        localStorage.setItem(PREFERENCE_KEY, preference)
    } catch {
        /* localStorage may be unavailable (e.g. disabled cookies) – ignore. */
    }
}

/* ======================================
   Browser "persistent storage" permission
   ====================================== */

/** Whether the browser has already granted persistent (non-evictable) storage. */
export async function isPersistentStorageGranted(): Promise<boolean> {
    try {
        if (navigator.storage?.persisted) {
            return await navigator.storage.persisted()
        }
    } catch {
        /* not supported – treat as not granted */
    }
    return false
}

/**
 * Ask the browser to mark this origin's storage as persistent.
 * Best-effort: some browsers grant/deny automatically based on engagement, so the
 * returned value is informational only – IndexedDB still works without it.
 */
export async function requestPersistentStorage(): Promise<boolean> {
    try {
        if (navigator.storage?.persist) {
            return await navigator.storage.persist()
        }
    } catch {
        /* not supported */
    }
    return false
}

export function isIndexedDbAvailable(): boolean {
    try {
        return typeof indexedDB !== "undefined" && indexedDB !== null
    } catch {
        return false
    }
}

/* ======================================
   IndexedDB backend
   ====================================== */

function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)
        request.onupgradeneeded = () => {
            const db = request.result
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" })
            }
        }
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

class IndexedDbProjectStore implements ProjectStore {
    readonly mode = "indexeddb" as const

    constructor(private readonly db: IDBDatabase) {}

    getAll(): Promise<Project[]> {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll()
            request.onsuccess = () => resolve((request.result as Project[]) ?? [])
            request.onerror = () => reject(request.error)
        })
    }

    get(id: string): Promise<Project | undefined> {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(id)
            request.onsuccess = () => resolve(request.result as Project | undefined)
            request.onerror = () => reject(request.error)
        })
    }

    save(project: Project): Promise<void> {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(STORE_NAME, "readwrite")
            tx.objectStore(STORE_NAME).put(project)
            tx.oncomplete = () => resolve()
            tx.onerror = () => reject(tx.error)
        })
    }

    remove(id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(STORE_NAME, "readwrite")
            tx.objectStore(STORE_NAME).delete(id)
            tx.oncomplete = () => resolve()
            tx.onerror = () => reject(tx.error)
        })
    }
}

/* ======================================
   localStorage backend
   ====================================== */

class LocalStorageProjectStore implements ProjectStore {
    readonly mode = "localstorage" as const

    private readAll(): Project[] {
        try {
            const raw = localStorage.getItem(LOCALSTORAGE_PROJECTS_KEY)
            if (!raw) return []
            const parsed = JSON.parse(raw)
            return Array.isArray(parsed) ? (parsed as Project[]) : []
        } catch {
            return []
        }
    }

    private writeAll(projects: Project[]): void {
        localStorage.setItem(LOCALSTORAGE_PROJECTS_KEY, JSON.stringify(projects))
    }

    async getAll(): Promise<Project[]> {
        return this.readAll()
    }

    async get(id: string): Promise<Project | undefined> {
        return this.readAll().find((project) => project.id === id)
    }

    async save(project: Project): Promise<void> {
        const projects = this.readAll()
        const index = projects.findIndex((existing) => existing.id === project.id)
        if (index >= 0) {
            projects[index] = project
        } else {
            projects.push(project)
        }
        this.writeAll(projects)
    }

    async remove(id: string): Promise<void> {
        this.writeAll(this.readAll().filter((project) => project.id !== id))
    }
}

/* ======================================
   Factory
   ====================================== */

/**
 * Creates a project store for the requested backend. If IndexedDB is requested but
 * unavailable (private mode, blocked, etc.) this transparently falls back to localStorage,
 * so callers should read `store.mode` to learn which backend was actually used.
 */
export async function createProjectStore(preference: StoragePreference): Promise<ProjectStore> {
    if (preference === "indexeddb" && isIndexedDbAvailable()) {
        try {
            const db = await openDatabase()
            return new IndexedDbProjectStore(db)
        } catch (error) {
            console.error("Failed to open IndexedDB, falling back to localStorage:", error)
        }
    }
    return new LocalStorageProjectStore()
}
