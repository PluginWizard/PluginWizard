package net.kalbskinder.service

import net.kalbskinder.config.BuildConfig
import net.kalbskinder.models.BuildRequest
import net.kalbskinder.models.BuildResponse
import org.slf4j.LoggerFactory
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.nio.file.Files
import java.nio.file.Path
import java.time.Duration
import java.util.Base64
import java.util.concurrent.TimeUnit

/**
 * Assembles and builds a plugin on the server.
 *
 * The client only sends the generated Java class and the config. The
 * structural files (build scripts, gradle wrapper, main class) come from a
 * trusted project template that this service fetches itself, so a client can
 * never smuggle extra files, overwrite the build script, or escape the build
 * directory. The two client-controlled blobs are written to fixed, known
 * paths, and the metadata that flows into the build files is validated first.
 */
class BuildService(private val config: BuildConfig) {

    private val httpClient: HttpClient = HttpClient.newBuilder()
        .version(HttpClient.Version.HTTP_1_1)
        .connectTimeout(TEMPLATE_FETCH_TIMEOUT)
        .build()
    private val logger = LoggerFactory.getLogger(BuildService::class.java)

    private companion object {
        val TEMPLATE_FETCH_TIMEOUT: Duration = Duration.ofSeconds(30)

        const val TEMPLATE_MAIN_CLASS_PATH = "src/main/java/net/kalbskinder/plugin/Plugin.java"
        const val TEMPLATE_USER_PLUGIN_PATH = "src/main/java/net/kalbskinder/plugin/UserPlugin.java"
        const val CONFIG_PATH = "src/main/resources/config.yml"
        const val BUILD_GRADLE_PATH = "build.gradle"
        const val PLUGIN_YML_PATH = "src/main/resources/plugin.yml"

        // The package and main-class name hard-coded in the template sources.
        // They are rewritten to the project's own identity on build.
        const val TEMPLATE_PACKAGE = "net.kalbskinder.plugin"
        const val TEMPLATE_MAIN_CLASS = "Plugin"

        val GROUP_ID_REGEX = Regex("^[A-Za-z0-9_.]+$")
        val VERSION_REGEX = Regex("^[A-Za-z0-9_.+-]+$")

        // Trusted template files, relative to <templateBaseUrl>/plugin/.
        val TEMPLATE_FILES = listOf(
            ".gitignore",
            "build.gradle",
            "gradle.properties",
            "gradlew",
            "gradlew.bat",
            "settings.gradle",
            "gradle/wrapper/gradle-wrapper.jar",
            "gradle/wrapper/gradle-wrapper.properties",
            "src/main/resources/plugin.yml",
            "src/main/resources/config.yml",
            "src/main/java/net/kalbskinder/plugin/Plugin.java",
            "src/main/java/net/kalbskinder/plugin/UserPlugin.java",
        )
    }

    fun build(request: BuildRequest): BuildResponse {
        val start = System.currentTimeMillis()
        logger.info(
            "Starting build for plugin '{}' (groupId='{}', version='{}')",
            request.pluginName, request.groupId, request.version,
        )

        val validationErrors = validate(request)
        if (validationErrors.isNotEmpty()) {
            logger.warn("Build for '{}' rejected: {}", request.pluginName, validationErrors)
            return BuildResponse(success = false, errors = validationErrors)
        }

        val naming = resolveNaming(request)

        Files.createDirectories(Path.of(config.tempDir))
        val workDir = Files.createTempDirectory(Path.of(config.tempDir), "pwiz-")
        logger.debug("Created work directory {} for '{}'", workDir, request.pluginName)

        try {
            try {
                fetchTemplate(workDir)
            } catch (e: Exception) {
                logger.error("Failed to fetch plugin template for '{}'", request.pluginName, e)
                return BuildResponse(
                    success = false,
                    errors = listOf("Failed to fetch plugin template: ${e.message}")
                )
            }

            // Move the template main class into the project's own package,
            // rewriting its package declaration and class name.
            val mainClassSource = Files.readString(safeResolve(workDir, TEMPLATE_MAIN_CLASS_PATH))
            Files.deleteIfExists(safeResolve(workDir, TEMPLATE_MAIN_CLASS_PATH))
            Files.deleteIfExists(safeResolve(workDir, TEMPLATE_USER_PLUGIN_PATH))
            writeText(safeResolve(workDir, naming.mainClassPath), patchMainClass(mainClassSource, naming))

            // Inject the client-provided sources into the project package.
            writeText(safeResolve(workDir, naming.userPluginPath), patchUserPlugin(request.code, naming))
            writeText(workDir.resolve(CONFIG_PATH), request.config)

            // Apply the project metadata to the template files
            patchText(workDir.resolve(BUILD_GRADLE_PATH)) { patchBuildGradle(it, request) }
            patchText(workDir.resolve(PLUGIN_YML_PATH)) { patchPluginYml(it, request, naming) }
            logger.debug("Assembled project for '{}' in {}", request.pluginName, workDir)

            // Build the assembled project
            return runGradleBuild(workDir, start)
        } finally {
            workDir.toFile().deleteRecursively()
            logger.debug("Cleaned up work directory {}", workDir)
        }
    }

    private fun validate(request: BuildRequest): List<String> {
        val errors = mutableListOf<String>()
        if (!GROUP_ID_REGEX.matches(request.groupId)) {
            errors.add("Invalid group id '${request.groupId}'. Only letters, digits, '.' and '_' are allowed.")
        }
        if (!VERSION_REGEX.matches(request.version)) {
            errors.add("Invalid version '${request.version}'. Only letters, digits, '.', '+', '-' and '_' are allowed.")
        }
        return errors
    }

    private fun fetchTemplate(workDir: Path) {
        val base = config.templateBaseUrl.trimEnd('/')
        logger.info("Fetching {} template file(s) from {}", TEMPLATE_FILES.size, base)
        for (relative in TEMPLATE_FILES) {
            val target = safeResolve(workDir, relative)

            val response = httpClient.send(
                HttpRequest.newBuilder(URI.create("$base/plugin/$relative"))
                    .timeout(TEMPLATE_FETCH_TIMEOUT)
                    .GET()
                    .build(),
                HttpResponse.BodyHandlers.ofByteArray()
            )
            if (response.statusCode() != 200) {
                throw IllegalStateException("GET $relative returned HTTP ${response.statusCode()}")
            }

            Files.createDirectories(target.parent)
            Files.write(target, response.body())
            logger.debug("Fetched template file {} ({} bytes)", relative, response.body().size)
        }
    }

    /** Resolve a path inside the work dir, refusing anything that escapes it. */
    private fun safeResolve(workDir: Path, relative: String): Path {
        val target = workDir.resolve(relative).normalize()
        // Defence in depth: never touch anything outside the work dir.
        if (!target.startsWith(workDir)) {
            throw IllegalStateException("Illegal path: $relative")
        }
        return target
    }

    /** The plugin's Java identity, derived from the plugin name and group id. */
    private data class PluginNaming(
        val className: String,
        val packageName: String,
    ) {
        val packagePath: String get() = packageName.replace('.', '/')
        val mainClassPath: String get() = "src/main/java/$packagePath/$className.java"
        val userPluginPath: String get() = "src/main/java/$packagePath/UserPlugin.java"
    }

    /** Resolve the plugin's Java identity (class name + package). */
    private fun resolveNaming(request: BuildRequest): PluginNaming {
        val groupSegments = request.groupId.split('.')
            .map(::sanitizeSegment)
            .filter { it.isNotEmpty() }
        val packageName = (groupSegments + toPackageSegment(request.pluginName)).joinToString(".")
        return PluginNaming(toClassName(request.pluginName), packageName)
    }

    /** Strip a string down to a Java-identifier-safe segment (no leading digits). */
    private fun sanitizeSegment(segment: String): String =
        segment.filter { it in 'A'..'Z' || it in 'a'..'z' || it in '0'..'9' || it == '_' }
            .dropWhile { it.isDigit() }

    /** Derive a PascalCase Java class name from a display name. */
    private fun toClassName(name: String): String {
        val pascal = name.split(Regex("[^A-Za-z0-9]+"))
            .filter { it.isNotEmpty() }
            .joinToString("") { it.replaceFirstChar(Char::uppercaseChar) }
            .dropWhile { it.isDigit() }
        return pascal.ifEmpty { TEMPLATE_MAIN_CLASS }
    }

    /** Derive a lowercase Java package segment from a display name. */
    private fun toPackageSegment(name: String): String {
        val segment = name.lowercase()
            .filter { it in 'a'..'z' || it in '0'..'9' }
            .dropWhile { it.isDigit() }
        return segment.ifEmpty { "plugin" }
    }

    /** Rewrite the main class template into the project's package and name. */
    private fun patchMainClass(content: String, naming: PluginNaming): String =
        content
            .replace("package $TEMPLATE_PACKAGE;", "package ${naming.packageName};")
            .replace(
                "class $TEMPLATE_MAIN_CLASS extends JavaPlugin",
                "class ${naming.className} extends JavaPlugin",
            )

    /** Rewrite the user plugin into the project's package, updating its
     * reference to the main class type. */
    private fun patchUserPlugin(content: String, naming: PluginNaming): String =
        content
            .replace("package $TEMPLATE_PACKAGE;", "package ${naming.packageName};")
            .replace(
                "private final $TEMPLATE_MAIN_CLASS plugin;",
                "private final ${naming.className} plugin;",
            )

    /** Update the gradle group id and version to match the project. */
    private fun patchBuildGradle(content: String, request: BuildRequest): String =
        content
            .replace(Regex("(?m)^group\\s*=\\s*['\"].*['\"]\\s*$")) { "group = '${request.groupId}'" }
            .replace(Regex("(?m)^version\\s*=\\s*['\"].*['\"]\\s*$")) { "version = '${request.version}'" }

    /** Set the plugin name / main class and fill the {{...}} placeholders in
     * plugin.yml with the project metadata. */
    private fun patchPluginYml(content: String, request: BuildRequest, naming: PluginNaming): String =
        content
            .replace(Regex("(?m)^name:.*$")) { "name: ${naming.className}" }
            .replace(Regex("(?m)^main:.*$")) { "main: ${naming.packageName}.${naming.className}" }
            .replace("{{version}}", request.version)
            .replace("{{description}}", yamlEscape(request.description))
            .replace("{{author}}", yamlEscape(request.author))

    /** Escape a value so it stays inside a double-quoted YAML scalar. */
    private fun yamlEscape(value: String): String =
        value.replace("\\", "\\\\").replace("\"", "\\\"").replace(Regex("[\\r\\n]+"), " ")

    private fun runGradleBuild(workDir: Path, start: Long): BuildResponse {
        workDir.resolve("gradlew").toFile().setExecutable(true)

        // Share the gradle distribution and dependency cache across builds so
        // only the very first build pays the download cost.
        val gradleHome = Path.of(config.tempDir).resolve("gradle-home")
            .also { Files.createDirectories(it) }

        val builder = ProcessBuilder("./gradlew", "shadowJar", "--no-daemon", "--console=plain")
            .directory(workDir.toFile())
            .redirectErrorStream(true)
        builder.environment()["GRADLE_USER_HOME"] = gradleHome.toAbsolutePath().toString()

        logger.info("Running 'gradlew shadowJar' in {} (timeout {}s)", workDir, config.timeoutSeconds)
        val process = builder.start()

        // Drain the output on a separate thread so a full pipe buffer can never
        // deadlock the build.
        val output = StringBuilder()
        val reader = Thread {
            process.inputStream.bufferedReader().forEachLine { output.appendLine(it) }
        }.apply { start() }

        val finished = process.waitFor(config.timeoutSeconds, TimeUnit.SECONDS)
        if (!finished) {
            logger.warn("Gradle build in {} exceeded timeout of {}s; killing process", workDir, config.timeoutSeconds)
            process.destroyForcibly()
            reader.join(1000)
            return BuildResponse(
                success = false,
                errors = listOf("Build exceeded timeout (${config.timeoutSeconds}s).")
            )
        }
        reader.join()

        val exitCode = process.exitValue()
        if (exitCode != 0) {
            val errors = parseBuildErrors(output.toString())
            logger.warn("Gradle build in {} failed with exit code {}: {} error line(s)", workDir, exitCode, errors.size)
            return BuildResponse(success = false, errors = errors)
        }

        val jar = findBuiltJar(workDir)
            ?: run {
                logger.error("Gradle build in {} succeeded but produced no jar artifact", workDir)
                return BuildResponse(
                    success = false,
                    errors = listOf("Build succeeded but no jar artifact was produced.")
                )
            }

        val buildTimeMs = System.currentTimeMillis() - start
        logger.info("Gradle build succeeded in {} ms, artifact {} ({} bytes)", buildTimeMs, jar.fileName, Files.size(jar))
        return BuildResponse(
            success = true,
            jarBase64 = Base64.getEncoder().encodeToString(Files.readAllBytes(jar)),
            buildTimeMs = buildTimeMs
        )
    }

    /** The shadow jar bundles the dependencies, so it is the largest jar produced. */
    private fun findBuiltJar(workDir: Path): Path? {
        val libs = workDir.resolve("build/libs")
        if (!Files.isDirectory(libs)) return null
        return Files.list(libs).use { stream ->
            stream.filter { it.toString().endsWith(".jar") }
                .max(compareBy { Files.size(it) })
                .orElse(null)
        }
    }

    private fun parseBuildErrors(output: String): List<String> {
        val compileErrors = output.lines().filter { it.contains("error:") }
        if (compileErrors.isNotEmpty()) return compileErrors
        // No compiler errors, surface the tail of the log for diagnostics.
        return output.lines().filter { it.isNotBlank() }.takeLast(20)
    }

    private fun writeText(target: Path, content: String) {
        Files.createDirectories(target.parent)
        Files.writeString(target, content)
    }

    private fun patchText(target: Path, transform: (String) -> String) {
        Files.writeString(target, transform(Files.readString(target)))
    }
}
