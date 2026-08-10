package net.kalbskinder.config

data class AppConfig(
    val cors: CorsConfig,
    val build: BuildConfig,
    val database: DatabaseConfig,
)

data class CorsConfig(val allowedHosts: List<String>)

data class BuildConfig(
    val tempDir: String,
    val timeoutSeconds: Long,
    val templateBaseUrl: String,
)

data class DatabaseConfig(
    val jdbcUrl: String,
    val username: String,
    val password: String,
    val maxPoolSize: Int,
)
