package net.kalbskinder.service

import net.kalbskinder.config.BuildConfig
import net.kalbskinder.models.BuildRequest
import net.kalbskinder.models.BuildResponse
import java.util.jar.JarEntry
import java.util.jar.JarOutputStream
import java.nio.file.Files
import java.nio.file.Path
import java.util.Base64
import java.util.zip.ZipInputStream
import java.util.concurrent.TimeUnit

class BuildService(private val config: BuildConfig) {
    fun build(request: BuildRequest): BuildResponse {
        val start = System.currentTimeMillis()
        Files.createDirectories(Path.of(config.tempDir))
        val workDir = Files.createTempDirectory(Path.of(config.tempDir), "pwiz-")

        try {
            // decode and unzip plugin zip
            val zipBytes = Base64.getDecoder().decode(request.pluginZipBase64)
            val unzipSuccess = unzip(zipBytes, workDir)
            if (!unzipSuccess) {
                return BuildResponse(success = false, errors = listOf("Failed to unzip plugin zip file"))
            }

            // collect java files
            val javaFiles = workDir.toFile()
                .walkTopDown()
                .filter { it.extension == "java" }
                .map { it.absolutePath }
                .toList()

            if (javaFiles.isEmpty()) {
                return BuildResponse(
                    success = false,
                    errors = listOf("No Java files found in zip")
                )
            }

            // output dir for class files
            val classesDir = workDir.resolve("classes").also { Files.createDirectories(it) }
            val process = ProcessBuilder(
                listOf("javac", "-d", classesDir.toString()) + javaFiles
            )
                .directory(workDir.toFile())
                .redirectErrorStream(true)
                .start()

            val finished = process.waitFor(config.timeoutSeconds, TimeUnit.SECONDS)
            if (!finished) {
                process.destroyForcibly()
                return BuildResponse(
                    success = false,
                    errors = listOf("Compilation exceeded timeout (${config.timeoutSeconds}s).")
                )
            }

            val output = process.inputStream.bufferedReader().readText()
            if (process.exitValue() != 0) {
                return BuildResponse(
                    success = false,
                    errors = parseJavacErrors(output)
                )
            }

            val jarFile = workDir.resolve("plugin.jar")
            buildJar(jarFile, classesDir, workDir)

            return BuildResponse(
                success = true,
                jarBase64 = Base64.getEncoder().encodeToString(jarFile.toFile().readBytes()),
                buildTimeMs = System.currentTimeMillis() - start
            )

        } finally {
            workDir.toFile().deleteRecursively()
        }
    }

    private fun unzip(zipBytes: ByteArray, targetDir: Path): Boolean {
        ZipInputStream(zipBytes.inputStream()).use { zis ->
            generateSequence { zis.nextEntry }
                .filterNot { it.isDirectory }
                .forEach { entry ->
                    val outFile = targetDir.resolve(entry.name).normalize().toFile()

                    // Zip Slip Check
                    if (!outFile.absolutePath.startsWith(targetDir.toAbsolutePath().toString())) {
                        return false
                    }

                    outFile.parentFile.mkdirs()
                    outFile.outputStream().use { zis.copyTo(it) }
                    return true
                }
        }
        return false
    }

    private fun buildJar(output: Path, classesDir: Path, workDir: Path) {
        JarOutputStream(output.toFile().outputStream()).use { jar ->
            // .class files
            classesDir.toFile().walkTopDown().filter { it.isFile }.forEach { file ->
                jar.putNextEntry(JarEntry(file.relativeTo(classesDir.toFile()).path))
                jar.write(file.readBytes())
                jar.closeEntry()
            }
            // resource files (config.yml, plugin.yml)
            workDir.toFile().walkTopDown()
                .filter { it.isFile && it.extension !in listOf("java", "class") }
                .filter { !it.startsWith(classesDir.toFile()) }
                .forEach { file ->
                    jar.putNextEntry(JarEntry(file.relativeTo(workDir.toFile()).path))
                    jar.write(file.readBytes())
                    jar.closeEntry()
                }
        }
    }

    private fun parseJavacErrors(output: String): List<String> =
        output.lines().filter { it.contains("error:") }
}