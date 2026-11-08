package net.kalbskinder.models

import kotlinx.serialization.Serializable

/**
 * A build request carries only the user-generated pieces of the plugin:
 * the translated Java class and the config. Everything structural (build
 * scripts, gradle wrapper, main class) is provided by the trusted project
 * template that the backend fetches itself — the client never uploads files.
 */
@Serializable
data class BuildRequest(
    val pluginName: String,
    val groupId: String,
    val version: String,
    val mcVersion: String = BuildRequest.DEFAULT_MC_VERSION,
    val description: String = "",
    val author: String = "",
    val code: String,
    val config: String,
) {
    companion object {
        const val DEFAULT_MC_VERSION = "26.3"
    }
}

/** One compiler error, located in the generated sources. */
@Serializable
data class BuildDiagnostic(
    /** File name only, e.g. "UserPlugin.java". */
    val file: String? = null,
    val line: Int? = null,
    /** 1-based column within [code]. */
    val column: Int? = null,
    val message: String,
    /** The offending source line, without its indentation. */
    val code: String? = null,
    /** Extra compiler info such as "symbol: variable x". */
    val details: List<String> = emptyList(),
)

@Serializable
data class BuildResponse(
    val success: Boolean,
    val jarBase64: String? = null,
    /** Short, human readable error summaries. */
    val errors: List<String> = emptyList(),
    /** Structured compiler errors, when the failure was a compile error. */
    val diagnostics: List<BuildDiagnostic> = emptyList(),
    /** Tail of the build output with server paths removed. */
    val log: String? = null,
    val buildTimeMs: Long = 0,
)
