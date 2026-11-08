package net.kalbskinder.service

import net.kalbskinder.models.BuildDiagnostic

/**
 * Turns raw Gradle output into something a user can read: structured
 * compiler errors, a short summary, and a log tail without the server's
 * build directory paths.
 */
object BuildOutputParser {

    /** How many lines of the cleaned log are sent back to the client. */
    private const val LOG_TAIL_LINES = 80

    // "<path>/UserPlugin.java:17: error: cannot find symbol". Gradle repeats
    // every error in its failure summary, indented, so leading space is allowed.
    private val COMPILER_ERROR = Regex("""^\s*(.+?\.java):(\d+): error: (.+)$""")
    private val CARET_LINE = Regex("""^\s*\^\s*$""")

    data class Result(
        val diagnostics: List<BuildDiagnostic>,
        val summary: List<String>,
        val log: String,
    )

    /**
     * @param hiddenPaths absolute paths (the build and gradle directories) that
     *     are removed from everything returned, longest first.
     */
    fun parse(output: String, hiddenPaths: List<String>): Result {
        val lines = sanitize(output, hiddenPaths).lines()
        val diagnostics = parseCompilerErrors(lines)

        val summary = when {
            diagnostics.isNotEmpty() -> diagnostics.map { diagnostic ->
                listOfNotNull(diagnostic.file, diagnostic.line?.toString()).joinToString(":")
                    .let { location -> if (location.isEmpty()) diagnostic.message else "$location: ${diagnostic.message}" }
            }
            else -> whatWentWrong(lines).ifEmpty { listOf("The build failed. See the build log for details.") }
        }

        val log = lines.dropLastWhile { it.isBlank() }.takeLast(LOG_TAIL_LINES).joinToString("\n")
        return Result(diagnostics, summary, log)
    }

    /** Replace the server's directories so paths read relative to the project. */
    fun sanitize(text: String, hiddenPaths: List<String>): String =
        hiddenPaths
            .filter { it.isNotBlank() }
            .sortedByDescending { it.length }
            .fold(text) { acc, path -> acc.replace("${path.trimEnd('/')}/", "").replace(path.trimEnd('/'), ".") }

    /**
     * Parse javac errors. Each looks like:
     * ```
     * src/main/java/.../UserPlugin.java:18: error: cannot find symbol
     *         String s = undefinedThing.toString();
     *                    ^
     *   symbol:   variable undefinedThing
     *   location: class UserPlugin
     * ```
     */
    private fun parseCompilerErrors(lines: List<String>): List<BuildDiagnostic> {
        val diagnostics = LinkedHashMap<Triple<String, Int, String>, BuildDiagnostic>()
        var i = 0
        while (i < lines.size) {
            val match = COMPILER_ERROR.matchEntire(lines[i])
            i++
            if (match == null) continue

            val (path, lineNumber, message) = match.destructured
            var code: String? = null
            var column: Int? = null
            val details = mutableListOf<String>()

            // The offending source line and the caret marking the column.
            if (i + 1 < lines.size && CARET_LINE.matches(lines[i + 1])) {
                val source = lines[i]
                val indent = source.length - source.trimStart().length
                code = source.trim()
                column = (lines[i + 1].indexOf('^') - indent).coerceAtLeast(0) + 1
                i += 2
            }

            // Indented extra info ("symbol: ...", "required: ...") up to the next error.
            while (i < lines.size && lines[i].startsWith(" ") && lines[i].isNotBlank() && !COMPILER_ERROR.matches(lines[i])) {
                details.add(lines[i].trim())
                i++
            }

            val key = Triple(path, lineNumber.toInt(), message.trim())
            // Gradle's summary repeats the error without context; keep the richer copy.
            val existing = diagnostics[key]
            if (existing == null || (existing.code == null && code != null)) {
                diagnostics[key] = BuildDiagnostic(
                    file = path.substringAfterLast('/'),
                    line = lineNumber.toInt(),
                    column = column,
                    message = message.trim(),
                    code = code,
                    details = details,
                )
            }
        }
        return diagnostics.values.toList()
    }

    /** The "* What went wrong:" section Gradle prints for non-compiler failures. */
    private fun whatWentWrong(lines: List<String>): List<String> {
        val start = lines.indexOfFirst { it.trim() == "* What went wrong:" }
        if (start == -1) return emptyList()
        return lines.drop(start + 1)
            .takeWhile { !it.trim().startsWith("* Try:") && !it.trim().startsWith("* Exception is:") }
            .map { it.trim().removePrefix("> ").trim() }
            .filter { it.isNotEmpty() }
    }
}
