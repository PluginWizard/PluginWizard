package net.kalbskinder

import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.plugins.cors.routing.CORS
import io.ktor.server.response.respondText
import io.ktor.server.routing.routing
import io.ktor.server.routing.get
import net.kalbskinder.config.AppConfig
import net.kalbskinder.config.BuildConfig
import net.kalbskinder.config.CorsConfig
import net.kalbskinder.routes.buildRoutes

fun main() {
    embeddedServer(Netty, port = 8080, module = Application::module).start(wait = true)
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
                .getString().toLong()
        )
    )

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
        buildRoutes(config.build)
    }
}