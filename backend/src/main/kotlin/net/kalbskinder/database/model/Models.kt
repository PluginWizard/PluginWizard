package net.kalbskinder.database.model

/**
 * This data will be saved as a new entry in the database
 */
data class ProjectData (
    val pluginName: String,
    val pluginVersion: String,
    val codeLength: String,
    val configLength: String,
    val buildSuccess: Boolean,
    val buildErrors: List<String> = emptyList(),
    val buildDurationMs: Long,
    val timestamp: Long
)

/**
 * The kind of failure a build ran into.
 */
enum class BuildErrorType {
    VALIDATION_ERROR,
    TEMPLATE_FETCH_FAILED,
    COMPILE_ERROR,
    TIMEOUT,
    NO_ARTIFACT,
    BUILD_FAILED,
}