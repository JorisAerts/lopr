import { outgoing } from './outgoing'
import type { IncomingMessage, ServerResponse } from 'http'
import * as http from 'http'
import * as https from 'https'
import { isReqHttps, setupOutgoing } from './utils'
import type { CreateProxyOptions } from './proxy'
import { getDecodedIncomingMessageData } from '../utils/incoming-message'
import { sendWsData } from '../server/websocket'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'
import { createErrorMessage, createProxyResponse } from '../utils/ws-messages'
import type { ProxyRequest } from './ProxyRequest'

export interface IncomingRequest {
  (req: IncomingMessage, res: ServerResponse, options: CreateProxyOptions): void
}

const inc = [
  /**
   * Sets `content-length` to '0' if request is of DELETE type.
   */
  function (req: IncomingMessage) {
    if (req.method === 'DELETE' && !req.headers['content-length']) {
      req.headers['content-length'] = '0'
    }
  },

  /**
   * Sets `x-forwarded-*` headers if specified in config.
   */
  function (req: IncomingMessage) {
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
  function (req: IncomingMessage, res: ServerResponse, options: CreateProxyOptions) {
    function response(proxyRes: IncomingMessage) {
      outgoing(req, res, proxyRes)

      // log the response to the websocket
      getDecodedIncomingMessageData(proxyRes)
        .then((b) => b.toString())
        .then((data) => sendWsData(WebSocketMessageType.ProxyResponse, createProxyResponse((req as ProxyRequest).uuid, proxyRes, data)))

      proxyRes.pipe(res)
    }

    function onError(err: string) {
      sendWsData(WebSocketMessageType.Error, createErrorMessage(err))
    }

    const requestOptions = setupOutgoing({}, req, res, options)
    if (requestOptions) {
      const proxyReq = (isReqHttps(req) ? https : http).request(requestOptions, response)
      proxyReq.on('error', onError)
      req.pipe(proxyReq)
    }
  },
] as IncomingRequest[]

export const incoming = (req: IncomingMessage, res: ServerResponse, options: CreateProxyOptions) => inc.forEach((come) => come(req, res, options))
