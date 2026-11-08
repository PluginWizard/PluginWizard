import { useState } from "react"
import { Check, ChevronRight, Copy, Lightbulb, TriangleAlert } from "lucide-react"
import type { BuildDiagnostic } from "../lib/codegen/export"

/** Everything known about a failed jar build. */
export interface BuildFailure {
    /** Short error summaries; shown when there are no diagnostics. */
    summary: string[]
    diagnostics: BuildDiagnostic[]
    log?: string
}

/**
 * Plain-language explanations for the compiler errors that block code
 * usually runs into. Matched against the start of javac's message.
 */
const HINTS: [RegExp, string][] = [
    [/^cannot find symbol/, "Something used here doesn't exist. Check the names of your variables, functions and parameters."],
    [/^incompatible types/, "A block gives a different kind of value than this spot expects, for example text where a number is needed."],
    [/cannot be applied to given types|no suitable (method|constructor) found/, "A function is called with the wrong number or kind of values. Check the inputs of the call block."],
    [/^missing return statement/, "A function that returns a value needs a \"return\" block at the end of every path."],
    [/^unreachable statement/, "Some blocks come after a \"return\" or \"break\" and can never run. Remove or move them."],
    [/is already defined/, "Two variables or parameters have the same name. Rename one of them."],
    [/might not have been initialized/, "A variable is used before it gets a value. Give it a value when you declare it."],
    [/^bad operand types?/, "The values on both sides of this operation don't fit together, for example comparing text with a number."],
    [/^cannot assign a value to final variable/, "This variable is marked as final, so it can't be changed after it is set."],
    [/^illegal start of|expected$|^not a statement|^class, interface, enum, or record expected/, "A block is placed somewhere it can't be used. Check the problems list in the editor."],
]

function hintFor(message: string): string | null {
    return HINTS.find(([pattern]) => pattern.test(message))?.[1] ?? null
}

/** Plain-text version of the failure, for the clipboard. */
function failureAsText(failure: BuildFailure): string {
    const errors = failure.diagnostics.length > 0
        ? failure.diagnostics.map((diagnostic) => [
            `${[diagnostic.file, diagnostic.line].filter(Boolean).join(":")}: ${diagnostic.message}`,
            diagnostic.code ? `    ${diagnostic.code}` : null,
            ...(diagnostic.details ?? []).map((detail) => `    ${detail}`),
        ].filter(Boolean).join("\n"))
        : failure.summary
    return [...errors, failure.log ? `\n--- Build log ---\n${failure.log}` : ""].join("\n").trim()
}

function CodeLine({ diagnostic }: { diagnostic: BuildDiagnostic }) {
    const code = diagnostic.code ?? ""
    const start = Math.min(Math.max((diagnostic.column ?? 1) - 1, 0), code.length)
    // Underline the word, string or single character the compiler points at.
    const length = /^(?:[\w$]+|"(?:[^"\\]|\\.)*"?)/.exec(code.slice(start))?.[0].length || 1

    return (
        <div className="mt-3 flex overflow-x-auto border border-border/60 bg-black/40 font-mono text-xs leading-6">
            {diagnostic.line != null && (
                <span className="select-none border-r border-border/60 px-3 text-right text-card-muted-foreground">
                    {diagnostic.line}
                </span>
            )}
            <pre className="px-3 text-foreground">
                {code.slice(0, start)}
                <span className="text-red-300 underline decoration-red-400 decoration-wavy underline-offset-4">
                    {code.slice(start, start + length)}
                </span>
                {code.slice(start + length)}
            </pre>
        </div>
    )
}

function DiagnosticItem({ diagnostic }: { diagnostic: BuildDiagnostic }) {
    const hint = hintFor(diagnostic.message)
    const location = [diagnostic.file, diagnostic.line].filter(Boolean).join(":")

    return (
        <li className="border-b border-border/60 px-5 py-4 last:border-b-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                {location && (
                    <span className="shrink-0 border border-red-500/40 bg-red-500/10 px-1.5 py-0.5 font-mono text-xs text-red-300">
                        {location}
                    </span>
                )}
                <span className="font-medium text-foreground">{diagnostic.message.replace(/;$/, "")}</span>
            </div>

            {hint && (
                <p className="mt-2 flex gap-2 text-sm text-card-muted-foreground">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
                    {hint}
                </p>
            )}

            {diagnostic.code && <CodeLine diagnostic={diagnostic} />}

            {diagnostic.details && diagnostic.details.length > 0 && (
                <pre className="mt-2 overflow-x-auto font-mono text-xs text-card-muted-foreground">
                    {diagnostic.details.join("\n")}
                </pre>
            )}
        </li>
    )
}

export function BuildErrors({ failure }: { failure: BuildFailure }) {
    const [copied, setCopied] = useState(false)
    const { diagnostics, summary, log } = failure
    const isCompileError = diagnostics.length > 0

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(failureAsText(failure))
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error("Failed to copy build errors:", error)
        }
    }

    return (
        <section className="w-full border border-border/80 bg-card text-left">
            <header className="flex items-start gap-3 border-b border-border/80 bg-red-500/10 px-5 py-4">
                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                <div className="flex-1">
                    <h2 className="font-semibold text-red-300">
                        {isCompileError
                            ? `${diagnostics.length} ${diagnostics.length === 1 ? "error" : "errors"} in the generated code`
                            : "The plugin could not be built"}
                    </h2>
                    <p className="mt-1 text-sm text-card-muted-foreground">
                        {isCompileError
                            ? "The code made from your blocks doesn't compile. Usually a block is in the wrong place or gets the wrong kind of value."
                            : "Something went wrong while building. Try again, and copy the details if it keeps happening."}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={copyToClipboard}
                    className="flex shrink-0 items-center gap-1.5 border border-border/80 bg-card-lighter px-2 py-1 text-xs font-medium hover:bg-foreground/15 cursor-pointer"
                >
                    {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                </button>
            </header>

            {isCompileError ? (
                <ul className="max-h-[45vh] overflow-y-auto">
                    {diagnostics.map((diagnostic, index) => (
                        <DiagnosticItem key={index} diagnostic={diagnostic} />
                    ))}
                </ul>
            ) : (
                <ul className="space-y-1 px-5 py-4 text-sm text-foreground">
                    {summary.map((message, index) => (
                        <li key={index} className="break-words">{message}</li>
                    ))}
                </ul>
            )}

            {log && (
                <details className="group border-t border-border/80">
                    <summary className="flex cursor-pointer select-none items-center gap-1.5 px-5 py-3 text-sm text-card-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
                        <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                        Build log
                    </summary>
                    <pre className="max-h-72 overflow-auto border-t border-border/60 bg-black/40 px-5 py-3 font-mono text-xs leading-5 text-card-muted-foreground">
                        {log}
                    </pre>
                </details>
            )}
        </section>
    )
}
