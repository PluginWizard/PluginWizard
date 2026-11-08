import { useEffect, useState } from "react"
import SyntaxHighlighter from "react-syntax-highlighter"
import { railscasts } from "react-syntax-highlighter/dist/esm/styles/hljs"
import { Check, Copy, Download, FileArchive, Package, TriangleAlert, X } from "lucide-react"
import { Project } from "../../types/types"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { validateVersion } from "../../lib/codegen/export"
import { sanitizeMinecraftVersion } from "../../lib/minecraftVersions"
import { MinecraftVersionSelect } from "../ui/minecraft-version-select"
import { BuildDetailsModal } from "./BuildDetailsModal"
import { WorkspaceProblem } from "../../lib/editor/workspaceChecks"

interface ExportModalProps {
  open: boolean
  project: Project | null
  onClose?: () => void
  onDownloadProject: () => void
  onDownloadZip: () => void
  onProjectUpdate: (updates: Partial<Pick<Project, "version" | "mcVersion">>) => void
  code: string | undefined
  config: string | undefined
  /** Problems found in the workspace; the .jar can't be built while there are any. */
  problems: WorkspaceProblem[]
  /** Close the export and show the problems list in the editor. */
  onShowProblems: () => void
}

/** How many problems the export notice lists before summarising the rest. */
const LISTED_PROBLEMS = 3

export function ExportModal({ open, project, onClose, onDownloadProject, onDownloadZip, onProjectUpdate, code, config, problems, onShowProblems }: ExportModalProps) {
    const [copiedField, setCopiedField] = useState<"code" | "config" | null>(null)
    const [buildDetailsOpen, setBuildDetailsOpen] = useState(false)
    const [version, setVersion] = useState("")
    const versionError = validateVersion(version)
    const hasGeneratedOutput = Boolean(code?.trim() || config?.trim())
    const canExportOutput = hasGeneratedOutput && !versionError
    const hasProblems = problems.length > 0
    const canBuildJar = !versionError && !hasProblems

    // Load the project's version whenever the modal opens. Edits while it is
    // open stay local until valid, so an invalid draft is never overwritten.
    useEffect(() => {
        if (open && project) setVersion(project.version ?? "1.0.0")
    }, [open, project?.id])

    const handleVersionInput = (value: string) => {
        setVersion(value)
        if (!validateVersion(value)) onProjectUpdate({ version: value.trim() })
    }

    useEffect(() => {
        if (!copiedField) return

        const timeoutId = window.setTimeout(() => {
            setCopiedField(null)
        }, 1800)

        return () => window.clearTimeout(timeoutId)
    }, [copiedField])

    const handleCopy = async (field: "code" | "config", text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedField(field)
        } catch {
            setCopiedField(null)
        }
    }

    if (!open || !project) return null

    return (
        <div
            className="fixed inset-0 z-102 flex items-center justify-center bg-black/60 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose?.()
                }
            }}
        >
            <div className="relative w-full max-w-6xl max-h-[95vh] overflow-y-scroll border border-border/80 bg-card-darker p-6 shadow-2xl sm:p-8">
                <button
                    type="button"
                    aria-label="Close modal"
                    onClick={() => onClose?.()}
                    className="absolute right-4 top-4 p-1.5 text-muted-foreground transition-colors hover:bg-card-lighter hover:text-foreground cursor-pointer"
                >
                    <X className="h-4 w-4" />
                </button>

                <h2 className="text-3xl font-semibold tracking-tight">Export {project.name}</h2>
                <p className="mt-2 mb-4 text-sm text-muted-foreground">
                    Download the project file, generated source bundle, or packaged plugin artifact.
                </p>

                <div className="flex flex-col gap-3 pb-4 sm:flex-row">
                    <Button
                        onClick={onDownloadProject}
                        className="flex h-auto flex-1 items-center justify-center gap-2 bg-card-lighter px-4 py-4 text-foreground hover:bg-foreground/15 cursor-pointer"
                    >
                        <Download className="h-5 w-5 shrink-0" />
                        Export Project .mcwizard
                    </Button>

                    <Button
                        onClick={onDownloadZip}
                        disabled={!canExportOutput}
                        className={`flex h-auto flex-1 items-center justify-center gap-2 px-4 py-4 ${
                            canExportOutput
                                ? "bg-card-lighter text-foreground hover:bg-foreground/15 cursor-pointer"
                                : "bg-card-lighter/80 text-white cursor-not-allowed! hover:bg-card-lighter/80"
                        }`}
                    >
                        <FileArchive className="h-5 w-5 shrink-0" />
                        Export Code .zip
                    </Button>

                    <Button
                        onClick={() => { if (canBuildJar) setBuildDetailsOpen(true) }}
                        disabled={!canBuildJar}
                        title={hasProblems ? "Fix the problems in your blocks first" : undefined}
                        className={`flex h-auto flex-1 items-center justify-center gap-2 px-4 py-4 text-white ${
                            !canBuildJar
                                ? "bg-green-600/50 cursor-not-allowed! hover:bg-green-600/50"
                                : "bg-green-600 hover:bg-green-700 cursor-pointer"
                        }`}
                    >
                        <Package className="h-5 w-5 shrink-0" />
                        Export Plugin .jar
                    </Button>
                </div>

                {hasProblems && (
                    <div className="mb-6 flex flex-col gap-3 border border-red-500/40 bg-red-500/10 px-4 py-3 sm:flex-row sm:items-start">
                        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                        <div className="flex-1">
                            <p className="font-medium text-red-300">
                                Fix {problems.length === 1 ? "1 problem" : `${problems.length} problems`} in your blocks before exporting the .jar
                            </p>
                            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-card-muted-foreground">
                                {problems.slice(0, LISTED_PROBLEMS).map((problem) => (
                                    <li key={problem.id}>{problem.message}</li>
                                ))}
                                {problems.length > LISTED_PROBLEMS && (
                                    <li>and {problems.length - LISTED_PROBLEMS} more</li>
                                )}
                            </ul>
                        </div>
                        <Button variant="outline" onClick={onShowProblems} className="shrink-0 cursor-pointer">
                            Show problems
                        </Button>
                    </div>
                )}

                <div className="grid gap-4 pb-6 sm:grid-cols-2 sm:max-w-2xl">
                    <div className="space-y-2">
                        <Label htmlFor="exportVersion" className="text-sm font-medium">Plugin Version</Label>
                        <Input
                            id="exportVersion"
                            placeholder="1.0.0"
                            value={version}
                            onChange={(e) => handleVersionInput(e.target.value)}
                            className={`h-11 border-border focus:border-muted-foreground/40 ${versionError ? "border-red-500" : ""}`}
                        />
                        {versionError && <p className="text-sm text-red-500 mt-1">{versionError}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="exportMcVersion" className="text-sm font-medium">Minecraft Version</Label>
                        <MinecraftVersionSelect
                            id="exportMcVersion"
                            value={sanitizeMinecraftVersion(project.mcVersion)}
                            onChange={(mcVersion) => onProjectUpdate({ mcVersion: sanitizeMinecraftVersion(mcVersion) })}
                            className="h-11 border-border focus:border-muted-foreground/40"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {code && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3">
                                <span className="block font-bold">Plugin.java</span>
                                <button
                                    type="button"
                                    onClick={() => handleCopy("code", code)}
                                    className="inline-flex items-center gap-2 border border-border/80 bg-card-darker px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-card-lighter cursor-pointer"
                                >
                                    {copiedField === "code" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    {copiedField === "code" ? "Copied!" : "Copy"}
                                </button>
                            </div>
                            <div className="border border-border/80 max-h-100 overflow-y-scroll">
                                <SyntaxHighlighter language="java" style={railscasts} showLineNumbers={true} wrapLongLines={false}>
                                    {code}
                                </SyntaxHighlighter>
                            </div>
                        </div>
                    )}

                    {config && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3">
                                <span className="block font-bold">config.yml</span>
                                <button
                                    type="button"
                                    onClick={() => handleCopy("config", config)}
                                    className="inline-flex items-center gap-2 border border-border/80 bg-card-darker px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-card-lighter cursor-pointer"
                                >
                                    {copiedField === "config" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    {copiedField === "config" ? "Copied!" : "Copy"}
                                </button>
                            </div>
                            <div className="border border-border/80 max-h-100 overflow-y-scroll">
                                <SyntaxHighlighter language="yaml" style={railscasts} showLineNumbers={true} wrapLongLines={false}>
                                    {config}
                                </SyntaxHighlighter>
                            </div>
                        </div>
                    )}

                    {!code && !config && (
                        <span className="text-muted-foreground">No code could be generated</span>
                    )}
                </div>
            </div>


            <BuildDetailsModal open={buildDetailsOpen} project={project} code={code} config={config} onClose={() => setBuildDetailsOpen(false)} />
        </div>
    )
}