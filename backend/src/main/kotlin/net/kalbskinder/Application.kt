package net.kalbskinder

import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationStopped
import io.ktor.server.application.install
import io.ktor.server.application.log
import io.ktor.server.netty.EngineMain
import io.ktor.server.plugins.calllogging.CallLogging
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.plugins.cors.routing.CORS
import io.ktor.server.request.httpMethod
import io.ktor.server.request.path
import io.ktor.server.response.respondText
import io.ktor.server.routing.routing
import io.ktor.server.routing.get
import net.kalbskinder.config.AppConfig
import net.kalbskinder.config.BuildConfig
import net.kalbskinder.config.CorsConfig
import net.kalbskinder.config.DatabaseConfig
import net.kalbskinder.database.Database
import net.kalbskinder.routes.buildRoutes
import org.slf4j.event.Level

fun main(args: Array<String>) {
    EngineMain.main(args)
}

fun Application.module() {
    val config = AppConfig(
        cors = CorsConfig(
            allowedHosts = environment.config
                .property("pluginwizard.cors.allowedHosts")
                .getList()
        ),
        build = BuildConfig(
            tempDir = environment.config
                .property("pluginwizard.build.tempDir")
                .getString(),
            timeoutSeconds = environment.config
                .property("pluginwizard.build.timeoutSeconds")
                .getString().toLong(),
            templateBaseUrl = System.getenv("PLUGINWIZARD_TEMPLATE_BASE_URL")
                ?: environment.config
                    .property("pluginwizard.build.templateBaseUrl")
                    .getString()
        ),
        database = DatabaseConfig(
            jdbcUrl = System.getenv("PLUGINWIZARD_DB_URL")
                ?: environment.config
                    .property("pluginwizard.database.jdbcUrl")
                    .getString(),
            username = System.getenv("PLUGINWIZARD_DB_USER")
                ?: environment.config
                    .property("pluginwizard.database.username")
                    .getString(),
            password = System.getenv("PLUGINWIZARD_DB_PASSWORD")
                ?: environment.config
                    .property("pluginwizard.database.password")
                    .getString(),
            maxPoolSize = (System.getenv("PLUGINWIZARD_DB_POOL_SIZE")
                ?: environment.config
                    .property("pluginwizard.database.maxPoolSize")
                    .getString()).toInt(),
        )
    )

    log.info(
        "Starting PluginWizard backend: allowedHosts={}, build.tempDir={}, build.timeoutSeconds={}, build.templateBaseUrl={}, database.jdbcUrl={}",
        config.cors.allowedHosts,
        config.build.tempDir,
        config.build.timeoutSeconds,
        config.build.templateBaseUrl,
        config.database.jdbcUrl,
    )

    val database = Database.connect(config.database)
    monitor.subscribe(ApplicationStopped) { database?.close() }

    install(CallLogging) {
        level = Level.INFO
        format { call ->
            val status = call.response.status()
            "${call.request.httpMethod.value} ${call.request.path()} -> $status"
        }
    }
    install(ContentNegotiation) { json() }
    install(CORS) {
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Get)
        allowHeader(HttpHeaders.Authorization)
        allowHeader(HttpHeaders.ContentType)
        config.cors.allowedHosts.forEach { host -> allowHost(host) }
    }
    routing {
        get("/") {
            call.respondText("OK")
        }
        buildRoutes(config.build, database)
    }
}