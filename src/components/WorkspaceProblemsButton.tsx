import { useEffect, useRef, useState } from "react"
import * as Blockly from "blockly"
import { TriangleAlert } from "lucide-react"
import { Button } from "./ui/button"
import { WorkspaceProblem, fixAllProblems, revealProblem } from "../lib/editor/workspaceChecks"

interface WorkspaceProblemsButtonProps {
    workspace: Blockly.WorkspaceSvg | null
    problems: WorkspaceProblem[]
}

export default function WorkspaceProblemsButton({ workspace, problems }: WorkspaceProblemsButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const fixableCount = problems.filter((problem) => problem.fix).length

    // Close the list when clicking anywhere outside of it
    useEffect(() => {
        if (!isOpen) return
        const handleMouseDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
        }
        document.addEventListener("mousedown", handleMouseDown)
        return () => document.removeEventListener("mousedown", handleMouseDown)
    }, [isOpen])

    useEffect(() => {
        if (problems.length === 0) setIsOpen(false)
    }, [problems.length])

    if (!workspace || problems.length === 0) return null

    return (
        <div ref={containerRef} className="relative flex items-center">
            <Button
                onClick={() => setIsOpen((open) => !open)}
                variant="outline"
                className="border-red-500/50! bg-red-500/10! text-red-400 hover:bg-red-500/20! cursor-pointer"
            >
                <TriangleAlert className="h-4 w-4 mr-1" />
                {problems.length} {problems.length === 1 ? "problem" : "problems"}
            </Button>

            {isOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-96 border border-border/80 bg-card-darker shadow-2xl">
                    <div className="flex items-center justify-between border-b border-border/80 px-4 py-3">
                        <span className="text-sm font-semibold">Problems</span>
                        {fixableCount > 0 && (
                            <button
                                type="button"
                                onClick={() => fixAllProblems(workspace, problems)}
                                className="text-xs font-medium text-green-400 hover:text-green-300 cursor-pointer"
                            >
                                Fix all ({fixableCount})
                            </button>
                        )}
                    </div>

                    <ul className="max-h-80 overflow-y-auto">
                        {problems.map((problem) => (
                            <li key={problem.id} className="flex items-start gap-3 border-b border-border/40 px-4 py-3 last:border-b-0">
                                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                                <button
                                    type="button"
                                    onClick={() => revealProblem(workspace, problem)}
                                    disabled={!problem.blockId}
                                    className={`flex-1 text-left text-sm text-foreground ${problem.blockId ? "hover:underline cursor-pointer" : "cursor-default"}`}
                                >
                                    {problem.message}
                                </button>
                                {problem.fix && (
                                    <button
                                        type="button"
                                        onClick={() => problem.fix!.run(workspace)}
                                        className="shrink-0 border border-border/80 bg-card-lighter px-2 py-1 text-xs font-medium hover:bg-foreground/15 cursor-pointer"
                                    >
                                        {problem.fix.label}
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
