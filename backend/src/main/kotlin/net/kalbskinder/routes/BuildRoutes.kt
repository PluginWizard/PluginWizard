package net.kalbskinder.routes

import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Routing
import io.ktor.server.routing.post
import net.kalbskinder.models.BuildRequest
import net.kalbskinder.service.BuildService

fun Routing.buildRoutes() {
    val buildService = BuildService()

    post("/api/build/full") {
        val request = call.receive<BuildRequest>()
        val result = buildService.build(request)
        call.respond(result)
    }
}