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

@Serializable
data class BuildResponse(
    val success: Boolean,
    val jarBase64: String? = null,
    val errors: List<String> = emptyList(),
    val buildTimeMs: Long = 0,
)
