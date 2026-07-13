package net.kalbskinder.models

import kotlinx.serialization.Serializable

@Serializable
data class BuildRequest(
    val pluginName: String,
    val pluginVersion: String,
    val pluginZipBase64: String,
)

@Serializable
data class BuildResponse(
    val success: Boolean,
    val jarBase64: String? = null,
    val errors: List<String> = emptyList(),
    val buildTimeMs: Long = 0,
)