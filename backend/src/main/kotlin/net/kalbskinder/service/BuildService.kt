package net.kalbskinder.net.kalbskinder.service

import net.kalbskinder.net.kalbskinder.models.BuildRequest
import net.kalbskinder.net.kalbskinder.models.BuildResponse

class BuildService {
    fun build(request: BuildRequest): BuildResponse {
        return BuildResponse(success = true)
    }
}