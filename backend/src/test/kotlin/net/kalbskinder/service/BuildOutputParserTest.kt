package net.kalbskinder.service

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class BuildOutputParserTest {

    private val workDir = "/tmp/pluginwizard-builds/pwiz-123"
    private val hidden = listOf(workDir, "/tmp/pluginwizard-builds/gradle-home", "/tmp/pluginwizard-builds")

    private val compileFailure = """
        > Task :compileJava FAILED
        $workDir/src/main/java/net/example/testplugin/UserPlugin.java:16: error: incompatible types: String cannot be converted to int
                int count = "hello";
                            ^
        $workDir/src/main/java/net/example/testplugin/UserPlugin.java:18: error: cannot find symbol
                String s = undefinedThing.toString();
                           ^
          symbol:   variable undefinedThing
          location: class UserPlugin
        2 errors

        [Incubating] Problems report is available at: file://$workDir/build/reports/problems/problems-report.html

        FAILURE: Build failed with an exception.

        * What went wrong:
        Execution failed for task ':compileJava'.
        > Compilation failed; see the compiler error output for details.

        * Try:
        > Run with --info option to get more log output.

        BUILD FAILED in 3s
          $workDir/src/main/java/net/example/testplugin/UserPlugin.java:16: error: incompatible types: String cannot be converted to int
          $workDir/src/main/java/net/example/testplugin/UserPlugin.java:18: error: cannot find symbol
    """.trimIndent()

    @Test
    fun `parses compiler errors with code, column and details`() {
        val result = BuildOutputParser.parse(compileFailure, hidden)

        assertEquals(2, result.diagnostics.size)
        val first = result.diagnostics[0]
        assertEquals("UserPlugin.java", first.file)
        assertEquals(16, first.line)
        assertEquals("incompatible types: String cannot be converted to int", first.message)
        assertEquals("int count = \"hello\";", first.code)
        assertEquals('"', first.code!![first.column!! - 1])

        val second = result.diagnostics[1]
        assertEquals("String s = undefinedThing.toString();", second.code)
        assertEquals('u', second.code!![second.column!! - 1])
        assertEquals(listOf("symbol:   variable undefinedThing", "location: class UserPlugin"), second.details)

        assertEquals(
            listOf(
                "UserPlugin.java:16: incompatible types: String cannot be converted to int",
                "UserPlugin.java:18: cannot find symbol",
            ),
            result.summary,
        )
    }

    @Test
    fun `removes server paths from the log`() {
        val result = BuildOutputParser.parse(compileFailure, hidden)
        assertFalse(result.log.contains("/tmp/"), result.log)
        assertTrue(result.log.contains("src/main/java/net/example/testplugin/UserPlugin.java:16"))
    }

    @Test
    fun `falls back to what went wrong for other failures`() {
        val output = """
            FAILURE: Build failed with an exception.

            * What went wrong:
            Could not resolve all files for configuration ':compileClasspath'.
            > Could not find io.papermc.paper:paper-api:99.0.
              Searched in the following locations:
                - https://repo.papermc.io/repository/maven-public/io/papermc/paper/paper-api/99.0/paper-api-99.0.pom

            * Try:
            > Run with --stacktrace option to get the stack trace.
        """.trimIndent()

        val result = BuildOutputParser.parse(output, hidden)
        assertTrue(result.diagnostics.isEmpty())
        assertEquals("Could not resolve all files for configuration ':compileClasspath'.", result.summary[0])
        assertEquals("Could not find io.papermc.paper:paper-api:99.0.", result.summary[1])
    }
}
