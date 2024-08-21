import { createLocalProxyResponse } from './ws-messages'
import type { ProxyResponse } from '../server/ProxyResponse'
import type http from 'node:http'
import type { ServerOptions } from '../server/ServerOptions'
import { cacheDir } from './temp-dir'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

export const captureResponse = (res: ProxyResponse, options: ServerOptions) => {
  // Variables to capture response data
  let responseBody = ''
  let responseHeaders = Object.create(null) as http.OutgoingHttpHeaders
  let responseStatusCode = 200 // Default status code

  // Override the `writeHead` method to capture status code and headers
  const originalWriteHead = res.writeHead
  res.writeHead = function (statusCode: any, headers: any) {
    responseStatusCode = statusCode
    responseHeaders = headers || responseHeaders // Capture headers
    // eslint-disable-next-line prefer-rest-params
    originalWriteHead.apply(res, arguments as any) // Call original `writeHead` method
  } as any

  // Override the `setHeader` method to capture individual header settings
  const originalSetHeader = res.setHeader
  res.setHeader = function (name: any, value: any) {
    responseHeaders[name] = value // Capture individual headers
    // eslint-disable-next-line prefer-rest-params
    originalSetHeader.apply(res, arguments as any) // Call original `setHeader` method
  } as any

  // Override the `write` method to capture body data
  const originalWrite = res.write
  res.write = function (chunk: any, encoding: any, callback: any) {
    responseBody += chunk // Append chunk to the response body
    originalWrite.call(res, chunk, encoding, callback) // Call original `write` method
  } as any

  // Override the `end` method to finalize capturing data
  const originalEnd = res.end
  res.end = function (chunk: any, encoding: any, callback: any) {
    if (chunk) {
      responseBody += chunk // Append final chunk to the response body
    }
    originalEnd.call(res, chunk, encoding, callback) // Call original `end` method

    if (responseBody.length) {
      const cache = cacheDir(options)
      mkdirSync(cache, { recursive: true })
      writeFileSync(join(cache, res.uuid), responseBody)
    }
    // send the response to the websocket
    options.cache.addResponse(createLocalProxyResponse(res.uuid, { ...responseHeaders }, responseBody))
  } as any

  return res
}
