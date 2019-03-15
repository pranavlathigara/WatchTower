package com.snakydesign.watchdog

import com.snakydesign.watchdog.models.RequestData
import com.snakydesign.watchdog.models.ResponseData

/**
 * @author Adib Faramarzi (adibfara@gmail.com)
 */
interface NetworkEventLogger {
    fun logRequest(requestSent: RequestData, logLevel: WatchdogInterceptor.LogLevel)
    fun logResponse(responseReceived: ResponseData, logLevel: WatchdogInterceptor.LogLevel)
}