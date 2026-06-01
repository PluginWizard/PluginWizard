import SyntaxHighlighter from "react-syntax-highlighter"
import { railscasts } from "react-syntax-highlighter/dist/esm/styles/hljs"
import { Download, FileArchive, Package, X } from "lucide-react"
import { Project } from "../../types/types"
import { Button } from "../ui/button"


interface ExportModalProps {
  open: boolean
  project: Project | null
  onClose?: () => void
  onDownloadProject: () => void
  onDownloadZip: () => void
  onDownloadJar: () => void
  code: string | undefined
  config: string | undefined
}

export function ExportModal({ open, project, onClose, onDownloadProject, onDownloadZip, onDownloadJar, code, config }: ExportModalProps) {
    if (!open || !project) return null

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose?.()
                }
            }}
        >
            <div className="relative w-full max-w-6xl max-h-[95vh] overflow-y-auto rounded-2xl border border-border/80 bg-card-darker p-6 shadow-2xl sm:p-8">
                <button
                    type="button"
                    aria-label="Close modal"
                    onClick={() => onClose?.()}
                    className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-card-lighter hover:text-foreground cursor-pointer"
                >
                    <X className="h-4 w-4" />
                </button>

                <h2 className="text-3xl font-semibold tracking-tight">Export {project.name}</h2>
                <p className="mt-2 mb-6 text-sm text-muted-foreground">
                    Download the project file, generated source bundle, or packaged plugin artifact.
                </p>

                <div className="flex flex-col gap-3 pb-6 sm:flex-row">
                    <Button
                        onClick={onDownloadProject}
                        className="flex h-auto flex-1 items-center justify-center gap-2 rounded-xl bg-card-lighter px-4 py-4 text-foreground hover:bg-foreground/15 cursor-pointer"
                    >
                        <Download className="h-5 w-5 shrink-0" />
                        Export Project .mcwizard
                    </Button>

                    <Button
                        onClick={onDownloadZip}
                        className="flex h-auto flex-1 items-center justify-center gap-2 rounded-xl bg-card-lighter px-4 py-4 text-foreground hover:bg-foreground/15 cursor-pointer"
                    >
                        <FileArchive className="h-5 w-5 shrink-0" />
                        Export Code .zip
                    </Button>

                    <Button
                        onClick={onDownloadJar}
                        className="flex h-auto flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-4 text-white hover:bg-green-700 cursor-pointer"
                    >
                        <Package className="h-5 w-5 shrink-0" />
                        Export Plugin .jar
                    </Button>
                </div>

                <div className="space-y-4">
                    {code && (
                        <div className="space-y-2">
                            <span className="block font-bold">Plugin.java</span>
                            <div className="overflow-hidden rounded-xl border border-border/80">
                                <SyntaxHighlighter language="java" style={railscasts} showLineNumbers={true} wrapLongLines={false}>
                                    {code}
                                </SyntaxHighlighter>
                            </div>
                        </div>
                    )}

                    {config && (
                        <div className="space-y-2">
                            <span className="block font-bold">config.yml</span>
                            <div className="overflow-hidden rounded-xl border border-border/80">
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
        </div>
    )
}