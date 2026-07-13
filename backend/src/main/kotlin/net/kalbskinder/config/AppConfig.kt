package net.kalbskinder.config

data class AppConfig(
    val cors: CorsConfig,
    val build: BuildConfig,
)

data class CorsConfig(val allowedHosts: List<String>)

data class BuildConfig(
    val tempDir: String,
    val timeoutSeconds: Long,
)
