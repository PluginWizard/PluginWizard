"use client"

import { useEffect, useRef, useState } from "react"
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
    ArrowLeft,
    Upload,
} from "lucide-react"

import { getEditorConfig, toolboxCss } from "../lib/editor/editorConfig"
import { Project } from "../types/types"
import { Link } from "react-router-dom"
import { defaultWorkspcaeJson } from "../lib/config"
import { getCustomBlocks } from "../lib/editor/blocks/CustomBlocks"
import StartModal from "../components/modal/StartModal"
import NewProjectModal from "../components/modal/NewProjectModal"
import { ExportModal } from "../components/modal/ExportModal"
import { ensureJavaGeneratorsLoaded, generateJava } from "../lib/codegen/generators/java"

interface ExportCode {
    code: string
    config: string
}

export default function EditorPage() {
    // Project & workspace
    const [project, setProject] = useState<Project>(null as any)
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

    // Modals
    const [isExportModalOpen, setIsExportModalOpen] = useState(false)
    const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false)

    // Refs
    const blocklyDiv = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Call fetchProjects when signed in
    useEffect(() => {
        setLoadedWorkspaceJson(defaultWorkspcaeJson)
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
                const project = JSON.parse(e.target?.result as string) as Project;
                setProject(project);
                setLoadedWorkspaceJson(project.workspaceJson);
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
            if (Object.keys(loadedWorkspaceJson).length === 0) {
                return
            }

            try {
                Blockly.serialization.workspaces.load(loadedWorkspaceJson, workspace)
                console.log("Workspace loaded successfully")
            } catch (e) {
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
                    
                    {/* Import/Export buttons */}
                    <div className="flex flex-row gap-3 justify-items-center">
                        <div className="flex items-center space-x-2">
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                variant="outline"
                                className="rounded-xl border-card-muted-foreground/30! bg-card-lighter! cursor-pointer"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Import
                            </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                onClick={openExportModal}
                                disabled={isExporting}
                                variant="outline"
                                className="rounded-xl border-card-muted-foreground/30! bg-card-lighter! cursor-pointer"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                {isExporting ? "Exporting..." : "Export"}
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
                <div ref={blocklyDiv} className="w-full h-[calc(100vh-198px)]" />
            </div>

            <StartModal
                onNewProject={() => setIsNewProjectModalOpen(true)}
                onOpenProject={(project) => {
                    setProject(project);
                    setLoadedWorkspaceJson(project.workspaceJson);
                }}
                isOpen={project === null}
            />

            <NewProjectModal
                isOpen={isNewProjectModalOpen}
                onClose={() => setIsNewProjectModalOpen(false)}
                onNewProject={(project) => {
                    setProject(project);
                    setLoadedWorkspaceJson(project.workspaceJson);
                    setIsNewProjectModalOpen(false);
                }}
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
