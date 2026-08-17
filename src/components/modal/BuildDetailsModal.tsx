import { useEffect, useState } from "react"
import SyntaxHighlighter from "react-syntax-highlighter"
import { railscasts } from "react-syntax-highlighter/dist/esm/styles/hljs"
import { AlertCircle, Check, Copy, Download, FileArchive, Loader2, Package, X } from "lucide-react"
import { Project } from "../../types/types"
import { Button } from "../ui/button"


interface BuildDetailsModalProps {
  open: boolean
  project: Project | null
  jarBuildErrors?: string[]
}

const progressBarTexts = [
    "Sending your code to the build server...",
    "Assembling your plugin...",
    "Compiling your plugin...",
    "Final touches and packaging...",
]

export function BuildDetailsModal({ open, project, jarBuildErrors = [] }: BuildDetailsModalProps) {
    if (!open || !project) return null

    return (
        <div className="fixed inset-0 z-102 flex items-center justify-center bg-black/60 p-4">
            <div className="relative w-full max-w-6xl max-h-[95vh] overflow-y-scroll rounded-2xl border border-border/80 bg-card-darker p-6 shadow-2xl sm:p-8">

                <h1>Exporting {project.name}</h1>

                <video
                    src="/videos/chickens-loading.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="mt-10 w-full max-w-md"
                />

                <div className="mt-6 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-card-muted-foreground">
                        {progressBarTexts[Math.min(jarBuildErrors.length, progressBarTexts.length - 1)]}
                    </span>
                </div>

                {/* Fake progress bar */}
                <div className="mt-4 h-2 w-full rounded-full bg-card-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(jarBuildErrors.length * 25, 100)}%`, transition: "width 0.5s ease-in-out" }}></div>
                </div>


                {jarBuildErrors.length > 0 && (
                    <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4">
                        <div className="flex items-center gap-2 font-medium text-red-400">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            The plugin could not be built.
                        </div>
                        <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-red-300">
                            {jarBuildErrors.map((error, index) => (
                                <li key={index} className="whitespace-pre-wrap break-words font-mono">{error}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}