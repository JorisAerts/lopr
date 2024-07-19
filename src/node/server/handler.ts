import type { IncomingMessage, RequestOptions, ServerResponse } from 'http'
import { request as httpRequest } from 'http'
import { request as httpsRequest } from 'https'
import { resolve } from 'path'
import { sendWsData } from './websocket'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'
import { createProxyRequest } from '../utils/proxy-request'
import type * as tls from 'node:tls'
import { packageRoot } from '../utils/package'

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
export const handleRequest = (req: IncomingMessage, res: ServerResponse) => {
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
