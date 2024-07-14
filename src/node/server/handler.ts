import type { IncomingMessage, ServerResponse } from 'http'
import { request } from 'http'
import { request as httpsRequest } from 'https'
import { inspect } from 'util'
import { resolve } from 'path'
import { sendWsData } from './websocket'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'
import { createProxyRequest } from '../utils/proxy-request'

/**
 * Forward requests
 */
export const handleRequest = (req: IncomingMessage, res: ServerResponse) => {
  //console.log({req, res})

  const str = inspect(req) //JSON.stringify(req )
  const path = resolve(process.cwd(), 'node_modules/.cache/js-proxy')

  //mkdirSync(path, {recursive: true})
  //writeFileSync(resolve(path, "req.json"), str, {flag: 'a+'})

  const trailers = [...req.rawTrailers]
  const url = req.url!

  console.log({ url })

  // log the request
  sendWsData(WebSocketMessageType.ProxyRequest, createProxyRequest(req))

  const customRequest = url.startsWith('https') ? httpsRequest : request

  const proxyReq = customRequest(url, { headers: req.headers }, (proxyRes) => {
    Object.entries(proxyRes.headersDistinct).forEach(([key, value]) => {
      if (proxyRes.statusCode) res.statusCode = proxyRes.statusCode
      res.setHeader(key, value ?? '')
    })
    proxyRes.on('data', (chunk) => res.write(chunk))
    proxyRes.on('end', () => res.end())
    proxyRes.on('error', (err) => console.log({ err }))
  })

  proxyReq.on('error', (err) => console.log({ err }))

  trailers.forEach((chunk) => proxyReq.write(chunk))
  proxyReq.end()
}
