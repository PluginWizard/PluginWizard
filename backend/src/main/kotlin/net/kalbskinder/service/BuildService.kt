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

        const val MAIN_CLASS_PATH = "src/main/java/net/kalbskinder/plugin/Plugin.java"
        const val USER_PLUGIN_PATH = "src/main/java/net/kalbskinder/plugin/UserPlugin.java"
        const val CONFIG_PATH = "src/main/resources/config.yml"
        const val BUILD_GRADLE_PATH = "build.gradle"
        const val SETTINGS_GRADLE_PATH = "settings.gradle"
        const val PLUGIN_YML_PATH = "src/main/resources/plugin.yml"

        // Root of the Java sources in the template. The Java files ship under
        // the template package net.kalbskinder.plugin and are relocated into
        // the project's own package during assembly.
        const val JAVA_SOURCE_ROOT = "src/main/java"

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

            // Relocate the Java sources into the project's own package and
            // rewrite the main class name, then inject the client's sources.
            val packageDir = workDir.resolve("$JAVA_SOURCE_ROOT/${pluginPackage(request).replace('.', '/')}")
            Files.createDirectories(packageDir)

            val mainClassSource = patchMainClass(Files.readString(workDir.resolve(MAIN_CLASS_PATH)), request)
            Files.deleteIfExists(workDir.resolve(MAIN_CLASS_PATH))
            Files.deleteIfExists(workDir.resolve(USER_PLUGIN_PATH))
            writeText(packageDir.resolve("${mainClassName(request)}.java"), mainClassSource)
            writeText(packageDir.resolve("UserPlugin.java"), patchUserPlugin(request.code, request))

            writeText(workDir.resolve(CONFIG_PATH), request.config)

            // Apply the project metadata to the template files
            patchText(workDir.resolve(BUILD_GRADLE_PATH)) { patchBuildGradle(it, request) }
            patchText(workDir.resolve(SETTINGS_GRADLE_PATH)) { patchSettingsGradle(it, request) }
            patchText(workDir.resolve(PLUGIN_YML_PATH)) { patchPluginYml(it, request) }
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
            val target = workDir.resolve(relative).normalize()
            // Defence in depth: never write outside the work dir.
            if (!target.startsWith(workDir)) {
                throw IllegalStateException("Illegal template path: $relative")
            }

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

    /** The PascalCase Java class name for the plugin's main class. */
    private fun mainClassName(request: BuildRequest): String {
        val pascal = request.pluginName
            .replace(Regex("[^A-Za-z0-9]+"), " ")
            .trim()
            .split(Regex("\\s+"))
            .filter { it.isNotEmpty() }
            .joinToString("") { it.replaceFirstChar { c -> c.uppercaseChar() } }
        return when {
            pascal.isEmpty() -> "Plugin"
            pascal[0].isDigit() -> "Plugin$pascal"
            else -> pascal
        }
    }

    /** The Java package for the exported plugin: <groupId>.<name-segment>. */
    private fun pluginPackage(request: BuildRequest): String {
        val segment = request.pluginName.lowercase().replace(Regex("[^a-z0-9]"), "")
        val safeSegment = when {
            segment.isEmpty() -> "plugin"
            segment[0].isDigit() -> "plugin$segment"
            else -> segment
        }
        return "${request.groupId}.$safeSegment"
    }

    /** A plugin.yml-safe plugin name derived from the project name. */
    private fun pluginYmlName(request: BuildRequest): String {
        val cleaned = request.pluginName.trim()
            .replace(Regex("[^A-Za-z0-9_.-]+"), "_")
            .trim('_')
        return cleaned.ifEmpty { "Plugin" }
    }

    /** Update the gradle group id and version to match the project. */
    private fun patchBuildGradle(content: String, request: BuildRequest): String =
        content
            .replace(Regex("(?m)^group\\s*=\\s*['\"].*['\"]\\s*$")) { "group = '${request.groupId}'" }
            .replace(Regex("(?m)^version\\s*=\\s*['\"].*['\"]\\s*$")) { "version = '${request.version}'" }

    /** Update the gradle root project name to match the project. */
    private fun patchSettingsGradle(content: String, request: BuildRequest): String =
        content.replace(Regex("(?m)^rootProject\\.name\\s*=\\s*['\"].*['\"]\\s*$")) { "rootProject.name = '${pluginYmlName(request)}'" }

    /** Rewrite the template package declaration to the project's package. */
    private fun patchPackage(content: String, request: BuildRequest): String =
        content.replace(Regex("(?m)^package\\s+net\\.kalbskinder\\.plugin\\s*;")) { "package ${pluginPackage(request)};" }

    /** Rewrite the main class source: package declaration and class name. */
    private fun patchMainClass(content: String, request: BuildRequest): String =
        patchPackage(content, request).replace(Regex("\\bclass\\s+Plugin\\b")) { "class ${mainClassName(request)}" }

    /** Rewrite the UserPlugin source: package declaration and main-class type reference. */
    private fun patchUserPlugin(content: String, request: BuildRequest): String =
        patchPackage(content, request).replace(Regex("\\bfinal\\s+Plugin\\s+plugin\\b")) { "final ${mainClassName(request)} plugin" }

    /** Fill the placeholders in plugin.yml with the project metadata. */
    private fun patchPluginYml(content: String, request: BuildRequest): String =
        content
            .replace(Regex("(?m)^name:.*$")) { "name: ${pluginYmlName(request)}" }
            .replace(Regex("(?m)^main:.*$")) { "main: ${pluginPackage(request)}.${mainClassName(request)}" }
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
