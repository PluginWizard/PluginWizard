import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, Loader2, RotateCw, X } from "lucide-react"
import { Project } from "../../types/types"
import { downloadBytes, pluginFileBaseName, requestPluginJar } from "../../lib/codegen/export"
import { BuildErrors, BuildFailure } from "../BuildErrors"
import { Button } from "../ui/button"

interface BuildDetailsModalProps {
    open: boolean
    project: Project | null
    code: string | undefined
    config: string | undefined
    onClose: () => void
}

const progressBarTexts = [
    "Sending your code to the build server...",
    "Assembling your plugin...",
    "Compiling your plugin...",
    "Final touches and packaging...",
]

export function BuildDetailsModal({ open, project, code, config, onClose }: BuildDetailsModalProps) {
    const [isBuildingJar, setIsBuildingJar] = useState(false)
    const [failure, setFailure] = useState<BuildFailure | null>(null)
    const [progress, setProgress] = useState(0)
    const [textIndex, setTextIndex] = useState(0)
    const [succeeded, setSucceeded] = useState(false)
    const [isShaking, setIsShaking] = useState(false)

    const exportCode = { code: code || "", config: config || "" }

    useEffect(() => {
        if (open && project && !isBuildingJar) {
            handleDownloadJar()
        }
    }, [open])

    // fake progress bar while building, capped at 90% until the build is finished
    useEffect(() => {
        if (!isBuildingJar) return
        let timeoutId: ReturnType<typeof setTimeout>

        const tick = () => {
            setProgress((prev) => {
                if (prev >= 90) return prev
                const step = 5 + Math.floor(Math.random() * 16)
                return Math.min(prev + step, 90)
            })
            timeoutId = setTimeout(tick, 400 + Math.floor(Math.random() * 700))
        }

        timeoutId = setTimeout(tick, 400 + Math.floor(Math.random() * 700))
        return () => clearTimeout(timeoutId)
    }, [isBuildingJar])

    // Step through the status messages while building, stopping at the last one.
    useEffect(() => {
        if (!isBuildingJar || textIndex >= progressBarTexts.length - 1) return
        const id = setTimeout(() => setTextIndex(textIndex + 1), 1800)
        return () => clearTimeout(id)
    }, [isBuildingJar, textIndex])

    // Warn the user before they reload/close the tab mid-build (can't be aborted).
    useEffect(() => {
        if (!isBuildingJar) return
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault()
            event.returnValue = ""
        }
        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [isBuildingJar])

    if (!open || !project) return null

    // Close when allowed; otherwise shake the modal to signal the build can't be aborted.
    const handleCloseAttempt = () => {
        if (isBuildingJar) {
            setIsShaking(true)
            return
        }
        onClose()
    }

    // Send the generated project to the build backend and download the compiled .jar
    const handleDownloadJar = async () => {
        if (!project || !exportCode || isBuildingJar) return

        setProgress(0)
        setTextIndex(0)
        setSucceeded(false)
        setIsBuildingJar(true)
        setFailure(null)
        try {
            const result = await requestPluginJar(project, exportCode)
            if (!result.success || !result.jar) {
                setFailure({
                    summary: result.errors.length > 0 ? result.errors : ["The plugin could not be built."],
                    diagnostics: result.diagnostics,
                    log: result.log,
                })
                return
            }

            setProgress(100)
            setSucceeded(true)
            downloadBytes(result.jar, `${pluginFileBaseName(project)}.jar`, "application/java-archive")
        } catch (error) {
            console.error("Failed to build .jar:", error)
            setFailure({
                summary: ["Could not reach the build server. Check your connection and try again in a moment."],
                diagnostics: [],
                log: error instanceof Error ? error.message : String(error),
            })
        } finally {
            setIsBuildingJar(false)
        }
    }

    const hasErrors = failure !== null

    return (
        <div
            className="fixed inset-0 z-102 flex items-center justify-center bg-black/60 p-4"
            onClick={handleCloseAttempt}
        >
            <div
                className={`relative flex w-full max-w-4xl max-h-[95vh] flex-col items-center overflow-y-auto border border-border/80 bg-card-darker p-12 text-center shadow-2xl sm:p-16 ${isShaking ? "animate-shake" : ""}`}
                onClick={(event) => event.stopPropagation()}
                onAnimationEnd={() => setIsShaking(false)}
            >
                {!isBuildingJar && (
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="absolute right-5 top-5 p-1.5 text-card-muted-foreground transition-colors hover:bg-card-lighter hover:text-foreground cursor-pointer"
                    >
                        <X className="h-6 w-6" />
                    </button>
                )}

                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    Exporting {project.name}
                </h1>

                <video
                    key={hasErrors ? "error" : "loading"}
                    src={hasErrors ? "/videos/steve-404.mp4" : "/videos/chickens-loading.mp4"}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={`mt-10 w-full transition-[max-width] duration-500 ${hasErrors ? "max-w-2xs" : "max-w-xl"}`}
                />

                <div className="mt-10 flex items-center justify-center gap-3">
                    {succeeded ? (
                        <CheckCircle2 className="h-7 w-7 text-green-500" />
                    ) : hasErrors ? (
                        <AlertCircle className="h-7 w-7 text-red-400" />
                    ) : (
                        <Loader2 className="h-7 w-7 animate-spin" />
                    )}
                    <span
                        key={succeeded ? "success" : hasErrors ? "error" : textIndex}
                        className="text-xl font-medium animate-fade-in"
                    >
                        {succeeded
                            ? <span className="text-green-500">Export successful</span>
                            : hasErrors
                                ? <span className="text-red-400">Export failed</span>
                                : <span className="text-card-muted-foreground">{progressBarTexts[textIndex]}</span>}
                    </span>
                </div>

                {/* Progress bar — diagonally striped green, hidden once the build has failed */}
                {!hasErrors && (
                    <div className="mt-6 h-4 w-full max-w-xl overflow-hidden bg-card-muted">
                        <div
                            className="h-full bg-green-500"
                            style={{
                                width: `${progress}%`,
                                transition: "width 0.6s ease-in-out",
                                backgroundImage:
                                    "repeating-linear-gradient(45deg, #15803d 0, #15803d 12px, transparent 12px, transparent 24px)",
                            }}
                        ></div>
                    </div>
                )}

                {failure && (
                    <>
                        <div className="mt-8 w-full">
                            <BuildErrors failure={failure} />
                        </div>
                        <div className="mt-6 flex w-full justify-end gap-3">
                            <Button variant="outline" onClick={onClose} className="cursor-pointer">
                                Close
                            </Button>
                            {failure.diagnostics.length === 0 && (
                                <Button onClick={handleDownloadJar} className="cursor-pointer">
                                    <RotateCw className="mr-1 h-4 w-4" />
                                    Try again
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}