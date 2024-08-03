import type { IncomingMessage, RequestOptions, ServerResponse } from 'http'
import { request as httpRequest } from 'http'
import { request as httpsRequest } from 'https'
import { resolve } from 'path'
import { sendWsData } from './websocket'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'
import { createProxyRequest } from '../utils/proxy-request'
import type * as tls from 'node:tls'
import { packageRoot } from '../utils/package'
import * as http from 'node:http'

const createOptions = (
  req: IncomingMessage
): RequestOptions & tls.SecureContextOptions => ({
  headers: req.headers,
  host: req.headers.host,
  method: req.method,
  insecureHTTPParser: true,

  //

  key: resolve(packageRoot, '/cert/key.pem'),
  cert: resolve(packageRoot, '/cert/cert.pem'),
})

/**
 * Forward requests
 */
export const handleRequestOld = (req: IncomingMessage, res: ServerResponse) => {
  sendWsData(WebSocketMessageType.ProxyRequest, createProxyRequest(req))

  const url = req.url!
  const requestOptions = createOptions(req)
  const request = url.startsWith('https') ? httpsRequest : httpRequest
  const proxyReq = request(url, { ...requestOptions }, (proxyRes) => {
    Object.entries(proxyRes.headersDistinct).forEach(([key, value]) => {
      if (proxyRes.statusCode) res.statusCode = proxyRes.statusCode
      res.setHeader(key, value ?? '')
    })
    proxyRes.on('data', (chunk) => res.write(chunk))
    proxyRes.on('end', () => res.end())
    proxyRes.on('error', (err) => console.log({ err }))
  })

  proxyReq.on('error', (err) => console.log({ err }))

  req.rawTrailers.forEach((chunk) => proxyReq.write(chunk))
  proxyReq.end()
}

export const handleRequest = (req: IncomingMessage, res: ServerResponse) => {
  console.log(`HTTP Request: ${req.method} ${req.url}`)

  // Options for the request to the target server
  const options = {
    hostname: req.headers.host,
    port: 80,
    path: req.url,
    method: req.method,
    headers: req.headers,
  }

  // Forward the request to the target server
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode!, proxyRes.headers)
    proxyRes.pipe(res)
  })

  // Handle errors
  proxyReq.on('error', (err) => {
    console.error('Error with proxy request:', err)
    res.writeHead(500)
    res.end('Error with proxy request')
  })

  req.pipe(proxyReq)
}
