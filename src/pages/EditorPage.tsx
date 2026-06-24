"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "../components/ui/button"
import { Separator } from "../components/ui/separator"
import * as Blockly from "blockly"
import { javascriptGenerator, Order } from "blockly/javascript"
import "blockly/blocks"
import "blockly/javascript"
import "blockly/msg/en"

// Blockly plugins
import { registerContinuousToolbox } from '@blockly/continuous-toolbox';
import '@blockly/field-colour-hsv-sliders';
import { FieldColourHsvSliders } from "@blockly/field-colour-hsv-sliders"

import { toolbox } from "../lib/editor/toolbox"

// Icons
import {
    Download,
    Undo,
    Redo,
    ZoomIn,
    ZoomOut,
    FolderOpen,
    Settings,
} from "lucide-react"

import { getEditorConfig, toolboxCss } from "../lib/editor/editorConfig"
import { Project } from "../types/types"
import { defaultWorkspcaeJson } from "../lib/config"
import { getCustomBlocks } from "../lib/editor/blocks/CustomBlocks"
import ProjectsModal from "../components/modal/ProjectsModal"
import NewProjectModal from "../components/modal/NewProjectModal"
import StorageConsentModal from "../components/modal/StorageConsentModal"
import { ExportModal } from "../components/modal/ExportModal"
import ProjectSettingsModal from "../components/modal/ProjectSettingsModal"
import { ensureJavaGeneratorsLoaded, generateJava } from "../lib/codegen/generators/java"
import {
    ProjectStore,
    createProjectStore,
    getStoragePreference,
    isPersistentStorageGranted,
    requestPersistentStorage,
    setStoragePreference,
} from "../lib/storage/projectStore"

interface ExportCode {
    code: string
    config: string
}

const AUTO_SAVE_DELAY_MS = 800

/** Insert or replace a project in a list by id, returning a new array. */
function upsertProject(projects: Project[], project: Project): Project[] {
    const index = projects.findIndex((existing) => existing.id === project.id)
    if (index >= 0) {
        const next = [...projects]
        next[index] = project
        return next
    }
    return [...projects, project]
}

export default function EditorPage() {
    // Project & workspace
    const [project, setProject] = useState<Project | null>(null)
    const [workspace, setWorkspace] = useState<any>(null)
    const [blocks, setBlocks] = useState<any>(null)
    const [blocksConfig, setBlocksConfig] = useState<any>(null)
    const [exportCode, setExportCode] = useState<ExportCode | undefined>(undefined)
    const [loadedWorkspaceJson, setLoadedWorkspaceJson] = useState<any>(null)

    // Loading & error states
    const [isLoading, setIsLoading] = useState(true)

    // Workspace action states
    const [isExporting, setIsExporting] = useState(false)
    const [isBlocklyLoaded, setIsBlocklyLoaded] = useState(false)

    // Persistence
    const [store, setStore] = useState<ProjectStore | null>(null)
    const [savedProjects, setSavedProjects] = useState<Project[]>([])
    const [needsStorageConsent, setNeedsStorageConsent] = useState(false)
    const [isResolvingConsent, setIsResolvingConsent] = useState(false)

    // Modals
    const [isExportModalOpen, setIsExportModalOpen] = useState(false)
    const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false)
    const [isProjectSettingsModalOpen, setIsProjectSettingsModalOpen] = useState(false)

    // Refs
    const blocklyDiv = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null);
    const projectRef = useRef<Project | null>(null)
    const storeRef = useRef<ProjectStore | null>(null)
    const saveTimerRef = useRef<number | null>(null)
    const suppressSaveRef = useRef(false)

    // Keep refs in sync so the workspace change listener always sees current values
    useEffect(() => { projectRef.current = project }, [project])
    useEffect(() => { storeRef.current = store }, [store])

    // Start with an empty workspace until a project is opened
    useEffect(() => {
        setLoadedWorkspaceJson(defaultWorkspcaeJson)
    }, [])

    // Resolve which storage backend to use when the editor opens
    useEffect(() => {
        let cancelled = false

        const resolveStorage = async () => {
            const preference = getStoragePreference()

            // The user already made a choice on a previous visit
            if (preference) {
                const resolved = await createProjectStore(preference)
                if (cancelled) return
                setStoragePreference(resolved.mode)
                setStore(resolved)
                return
            }

            // No explicit choice yet, but the browser already grants persistent storage
            if (await isPersistentStorageGranted()) {
                const resolved = await createProjectStore("indexeddb")
                if (cancelled) return
                setStoragePreference(resolved.mode)
                setStore(resolved)
                return
            }

            // Ask the user how they want their projects stored
            if (!cancelled) setNeedsStorageConsent(true)
        }

        void resolveStorage()
        return () => { cancelled = true }
    }, [])

    // Load saved projects once a store is available
    useEffect(() => {
        if (!store) return
        let cancelled = false
        store
            .getAll()
            .then((projects) => { if (!cancelled) setSavedProjects(projects) })
            .catch((error) => console.error("Failed to load saved projects:", error))
        return () => { cancelled = true }
    }, [store])

    const acceptStorageConsent = async () => {
        setIsResolvingConsent(true)
        await requestPersistentStorage()
        const resolved = await createProjectStore("indexeddb")
        setStoragePreference(resolved.mode)
        setStore(resolved)
        setNeedsStorageConsent(false)
        setIsResolvingConsent(false)
    }

    const declineStorageConsent = async () => {
        setIsResolvingConsent(true)
        const resolved = await createProjectStore("localstorage")
        setStoragePreference(resolved.mode)
        setStore(resolved)
        setNeedsStorageConsent(false)
        setIsResolvingConsent(false)
    }

    /* ======================================
       Project lifecycle
       ====================================== */

    const openProject = (projectToOpen: Project) => {
        setProject(projectToOpen)
        projectRef.current = projectToOpen
        setLoadedWorkspaceJson(projectToOpen.workspaceJson ?? {})
    }

    const persistProject = async (projectToSave: Project) => {
        setSavedProjects((prev) => upsertProject(prev, projectToSave))
        try {
            await storeRef.current?.save(projectToSave)
        } catch (error) {
            console.error("Failed to save project:", error)
        }
    }

    const importProject = async (imported: Project) => {
        await persistProject(imported)
        openProject(imported)
    }

    const handleDeleteProject = async (id: string) => {
        setSavedProjects((prev) => prev.filter((existing) => existing.id !== id))
        try {
            await storeRef.current?.remove(id)
        } catch (error) {
            console.error("Failed to delete project:", error)
        }
    }

    // Debounced auto-save of the current workspace into the active project
    const scheduleSave = useCallback(() => {
        if (saveTimerRef.current !== null) {
            window.clearTimeout(saveTimerRef.current)
        }
        saveTimerRef.current = window.setTimeout(async () => {
            const currentProject = projectRef.current
            const currentStore = storeRef.current
            if (!currentProject || !currentStore) return

            const activeWorkspace = Blockly.getMainWorkspace()
            if (!activeWorkspace) return

            const workspaceJson = Blockly.serialization.workspaces.save(activeWorkspace)
            const updated: Project = { ...currentProject, workspaceJson, updatedAt: Date.now() }
            projectRef.current = updated

            try {
                await currentStore.save(updated)
                setSavedProjects((prev) => upsertProject(prev, updated))
            } catch (error) {
                console.error("Auto-save failed:", error)
            }
        }, AUTO_SAVE_DELAY_MS)
    }, [])

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith(".mcwizard")) {
            event.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target?.result as string) as Project;
                void importProject(imported);
            } catch {
                console.error("Failed to load project file. Make sure it is a valid .mcwizard file.");
            }
        };
        reader.readAsText(file);
        event.target.value = "";
    };

    // Load workspace when Blockly is ready
    useEffect(() => {
        if (isBlocklyLoaded && loadedWorkspaceJson && workspace) {
            try {
                // Suppress auto-save for the events fired while programmatically loading
                suppressSaveRef.current = true
                workspace.clear()

                // New projects may intentionally have an empty workspace JSON.
                // In that case, keep the workspace blank after clearing.
                if (Object.keys(loadedWorkspaceJson).length > 0) {
                    Blockly.serialization.workspaces.load(loadedWorkspaceJson, workspace)
                }

                window.setTimeout(() => { suppressSaveRef.current = false }, 500)
                console.log("Workspace loaded successfully")
            } catch (e) {
                suppressSaveRef.current = false
                console.error("Error loading workspace:", e)
            }
        }
    }, [isBlocklyLoaded, loadedWorkspaceJson, workspace])

    // Fetch custom blocks and setup Blockly
    useEffect(() => {
        const loadBlocks = async () => {
            setBlocks(getCustomBlocks())
        }

        loadBlocks()

        const customStyle = document.createElement("style")
        customStyle.textContent = toolboxCss;
        document.head.appendChild(customStyle)
    }, [])

    // Setup blocks configuration when blocks are fetched
    useEffect(() => {
        if (blocks) {
            const config = {
                toolbox,
                blocks
            }

            setBlocksConfig(config)
        }
    }, [blocks])

    // Initialize Blockly when blocksConfig is ready
    useEffect(() => {
        if (!blocksConfig) return

        initializeBlockly()
    }, [blocksConfig])

    // Dispose workspace when component unmounts
    useEffect(() => {
        return () => {
            if (saveTimerRef.current !== null) {
                window.clearTimeout(saveTimerRef.current)
            }
            if (workspace) {
                workspace.dispose()
            }
        }
    }, [workspace])

    // Initialize Blockly workspace
    const initializeBlockly = () => {
        if (!blocklyDiv.current || !blocksConfig) return

        // Define custom blocks from JSON config
        Object.entries(blocksConfig.blocks).forEach(([blockType, blockDef]: [string, any]) => {
            Blockly.Blocks[blockType] = {
                init: function () {
                    this.jsonInit(blockDef)
                },
            }
        })

        try {
            registerContinuousToolbox()
        } catch (error) {
            console.log("Failed to load continous toolbox: ", error)
        }

        // Initialize workspace with improved settings
        const ws = Blockly.inject(blocklyDiv.current, getEditorConfig(toolbox))

        // Initialize color slider block
        Blockly.Blocks['colour_hsv_sliders'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField('hsv ')
                    .appendField(new FieldColourHsvSliders('#ff0000'), 'COLOUR');
                this.setOutput(true, 'Colour');
                this.setStyle('colour_blocks');
            },
        };
        javascriptGenerator.forBlock['colour_hsv_sliders'] = function (
            block,
            generator,
        ) {
            const code = generator.quote_(block.getFieldValue('COLOUR'));
            return [code, Order.ATOMIC];
        };

        // Persist workspace edits automatically
        ws.addChangeListener((event: any) => {
            if (suppressSaveRef.current) {
                if (event.type === Blockly.Events.FINISHED_LOADING) {
                    suppressSaveRef.current = false
                }
                return
            }
            if (event.isUiEvent) return
            scheduleSave()
        })

        setWorkspace(ws)
        setIsBlocklyLoaded(true)
        setIsLoading(false)
    }


    /* ======================================
       Editor Actions
       ====================================== */

    async function openExportModal() {
        setIsExporting(true)
        const generated = await handleExport()
        setExportCode(generated)
        setIsExporting(false)
        setIsExportModalOpen(true)
    }

    const handleDownloadProject = () => {
        if (!project) {
            return
        }

        const activeWorkspace = Blockly.getMainWorkspace()
        const workspaceJson = activeWorkspace
            ? Blockly.serialization.workspaces.save(activeWorkspace)
            : project.workspaceJson

        const projectExport: Project = {
            ...project,
            workspaceJson,
        }

        const blob = new Blob([JSON.stringify(projectExport, null, 2)], {
            type: "application/json",
        })
        const downloadUrl = URL.createObjectURL(blob)
        const link = document.createElement("a")
        const baseFileName = project.name.trim().length > 0 ? project.name.trim() : "pluginwizard-project"

        link.href = downloadUrl
        link.download = `${baseFileName}.mcwizard`
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(downloadUrl)
    }

    // Export blockly code to java code/classes and in the future a jar file
    // Returns generated code object containing java code and plugin.yml config as strings
    const handleExport = async (): Promise<ExportCode | undefined> => {
        setIsExporting(true)
        const workspace = Blockly.getMainWorkspace()
        if (!workspace) {
            setIsExporting(false)
            return undefined
        }
        console.log("Exporting workspace: ", Blockly.serialization.workspaces.save(workspace))

        setIsExporting(false)
        await ensureJavaGeneratorsLoaded();
        const generated = generateJava(workspace)
        return generated
    }

    /*
        Undo/Redo/Zoom Actions
    */
    const handleUndo = () => {
        if (workspace) {
            workspace.undo(false)
        }
    }

    const handleRedo = () => {
        if (workspace) {
            workspace.undo(true)
        }
    }

    const handleZoomIn = () => {
        if (workspace) {
            workspace.zoomCenter(1.2)
        }
    }

    const handleZoomOut = () => {
        if (workspace) {
            workspace.zoomCenter(-1.2)
        }
    }

    const handleSaveProjectSettings = async (updates: Pick<Project, "name" | "description" | "author" | "groupId">) => {
        if (!project) return

        const updatedProject: Project = {
            ...project,
            ...updates,
            updatedAt: Date.now(),
        }

        setProject(updatedProject)
        projectRef.current = updatedProject
        await persistProject(updatedProject)
        setIsProjectSettingsModalOpen(false)
    }

    return (
        <div className="bg-card-darker mt-16">
            {/* Toolbar */}
            <div className="border-b border-border bg-card-darker">
                <div className="flex items-center justify-between px-6 py-2">
                    {/* Undo/Redo/Zoom buttons */}
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={handleUndo} className="rounded-lg cursor-pointer">
                            <Undo className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleRedo} className="rounded-lg cursor-pointer">
                            <Redo className="h-4 w-4" />
                        </Button>
                        <Separator orientation="vertical" className="h-4" />
                        <Button variant="ghost" size="sm" onClick={handleZoomIn} className="rounded-lg cursor-pointer">
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleZoomOut} className="rounded-lg cursor-pointer">
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                    </div>

                    <div>
                        {/* Current project info */}
                        {project && (
                            <>
                                <div className="flex flex-row gap-2 items-center">
                                    <span className="text-sm font-medium text-foreground leading-tight">
                                        {project.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground leading-tight">
                                        {project.version ? `v${project.version}` : ""}
                                        {project.author ? ` · ${project.author}` : ""}
                                    </span>
                                </div>
                                <Separator orientation="vertical" className="h-8" />
                            </>
                        )}
                    </div>

                    {/* Right buttons */}
                    <div className="flex flex-row gap-3 justify-items-center">
                        <div className="flex items-center space-x-2">
                            <Button
                                onClick={() => setProject(null)}
                                variant="outline"
                                className="rounded-xl border-card-muted-foreground/30! bg-card-lighter! cursor-pointer"
                            >
                                <FolderOpen className="h-4 w-4 mr-1" />
                                Open project
                            </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                onClick={openExportModal}
                                disabled={isExporting}
                                variant="outline"
                                className="rounded-xl border-card-muted-foreground/30! bg-card-lighter! cursor-pointer"
                            >
                                <Download className="h-4 w-4 mr-1" />
                                {isExporting ? "Exporting..." : "Export"}
                            </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                onClick={() => setIsProjectSettingsModalOpen(true)}
                                disabled={!project}
                                variant="outline"
                                className="rounded-xl border-card-muted-foreground/30! bg-card-lighter! cursor-pointer"
                            >
                                <Settings className="h-4 w-4 mr-1" />
                                Settings
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 relative">
                {(!isBlocklyLoaded || isLoading) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
                        <div className="text-center space-y-4">
                            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-muted-foreground">Loading Editor...</p>
                        </div>
                    </div>
                )}
                <div ref={blocklyDiv} className="w-full h-[calc(100vh-117px)]" />
            </div>

            <StorageConsentModal
                isOpen={needsStorageConsent}
                isProcessing={isResolvingConsent}
                onAccept={() => void acceptStorageConsent()}
                onDecline={() => void declineStorageConsent()}
            />

            {store && (
                <ProjectsModal
                    isOpen={project === null && !needsStorageConsent && !isNewProjectModalOpen}
                    projects={savedProjects}
                    storageMode={store.mode}
                    onOpenProject={openProject}
                    onDeleteProject={(id) => void handleDeleteProject(id)}
                    onNewProject={() => setIsNewProjectModalOpen(true)}
                    onImportProject={(imported) => void importProject(imported)}
                />
            )}

            <NewProjectModal
                isOpen={isNewProjectModalOpen}
                onClose={() => setIsNewProjectModalOpen(false)}
                onNewProject={(created) => {
                    openProject(created);
                    void persistProject(created);
                    setIsNewProjectModalOpen(false);
                }}
            />

            <ProjectSettingsModal
                isOpen={isProjectSettingsModalOpen}
                project={project}
                onClose={() => setIsProjectSettingsModalOpen(false)}
                onSave={(updates) => void handleSaveProjectSettings(updates)}
            />

            <ExportModal
                open={isExportModalOpen}
                project={project}
                onClose={() => setIsExportModalOpen(false)}
                onDownloadProject={handleDownloadProject}
                onDownloadZip={() => {}}
                onDownloadJar={() => {}}
                code={exportCode?.code || ""}
                config={exportCode?.config || ""}
            />

            {/* Workspace file import */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".mcwizard"
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    )
}
