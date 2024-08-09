import { outgoing } from './outgoing'
import * as http from 'http'
import * as https from 'https'
import { isReqHttps, setupOutgoing } from './utils'
import type { CreateProxyOptions } from './proxy'
import { getIncomingMessageData } from '../utils/incoming-message'
import { sendWsData } from '../server/websocket'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'
import { createErrorMessage, createProxyResponse } from '../utils/ws-messages'
import type { ProxyRequest } from './ProxyRequest'
import type { ProxyResponse } from './ProxyResponse'

export interface IncomingRequest {
  (req: ProxyRequest, res: ProxyResponse, options: CreateProxyOptions): void
}

const inc = [
  /**
   * Sets `content-length` to '0' if request is of DELETE type.
   */
  function (req: ProxyRequest) {
    if (req.method === 'DELETE' && !req.headers['content-length']) {
      req.headers['content-length'] = '0'
    }
  },

  /**
   * Sets `x-forwarded-*` headers if specified in config.
   */
  function (req: ProxyRequest) {
    const values = {
      for: /* req.connection.remoteAddress || */ req.socket.remoteAddress,
      port: /* req.connection.remotePort || */ req.socket.remotePort,
      proto: isReqHttps(req) ? 'https' : 'http',
    }
    Object.keys(values)
      .map((header) => `x-forwarded-${header}`)
      .forEach((header) => {
        req.headers[header] = (req.headers[header] || '') + (req.headers[header] ? ',' : '') + values[header as keyof typeof values]
      })
  },

  /**
   * Pipe to the outgoing pipeline
   */
  function (req: ProxyRequest, res: ProxyResponse, options: CreateProxyOptions) {
    const requestOptions = setupOutgoing({}, req, res, options)
    if (requestOptions) {
      const proxyReq = (isReqHttps(req) ? https : http).request(requestOptions, (proxyRes) => {
        outgoing(req, res, proxyRes)

        // log the response to the websocket
        getIncomingMessageData(proxyRes)
          .then((b) => b.toString())
          .then((data) => sendWsData(WebSocketMessageType.ProxyResponse, createProxyResponse((req as ProxyRequest).uuid, proxyRes, data)))

        proxyRes.pipe(res)
      })
      proxyReq.on('error', (err) => {
        sendWsData(WebSocketMessageType.Error, createErrorMessage(err))
      })
      req.pipe(proxyReq)
    }
  },
] as IncomingRequest[]

export const incoming = (req: ProxyRequest, res: ProxyResponse, options: CreateProxyOptions) => inc.forEach((come) => come(req, res, options))
