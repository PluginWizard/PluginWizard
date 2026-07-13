package net.kalbskinder.routes

import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Routing
import io.ktor.server.routing.post
import net.kalbskinder.config.BuildConfig
import net.kalbskinder.models.BuildRequest
import net.kalbskinder.service.BuildService
import org.slf4j.LoggerFactory

private val logger = LoggerFactory.getLogger("net.kalbskinder.routes.BuildRoutes")

fun Routing.buildRoutes(config: BuildConfig) {
    val buildService = BuildService(config)

    post("/api/build/full") {
        val request = call.receive<BuildRequest>()
        logger.info(
            "Received full build request: pluginName='{}', groupId='{}', version='{}'",
            request.pluginName, request.groupId, request.version,
        )

        val result = buildService.build(request)

        if (result.success) {
            logger.info(
                "Build request for '{}' succeeded in {} ms",
                request.pluginName, result.buildTimeMs,
            )
        } else {
            logger.warn(
                "Build request for '{}' failed with {} error(s): {}",
                request.pluginName, result.errors.size, result.errors,
            )
        }

        call.respond(result)
    }
}
