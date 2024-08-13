import * as http from 'http'
import * as https from 'https'
import type { Socket } from 'net'
import * as utils from './utils'
import { isReqHttps, isReqWebSocket } from './utils'
import type { CreateProxyOptions } from './proxy'
import { isLocalhost } from '../utils/is-localhost'
import { sendWsData } from './websocket'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'
import { createErrorMessage } from '../utils/ws-messages'
import type { ProxyRequest } from './ProxyRequest'
import { createErrorHandler } from '../../client/utils/logging'

export interface WSIncomingRequest {
  (req: ProxyRequest, socket: Socket, options: CreateProxyOptions, server: http.Server | https.Server, head: Buffer): void
}

const NEWLINE = '\r\n'
const newLine = (socket: Socket) => socket.write(NEWLINE)

interface ForwardHeaders {
  for?: string
  port?: number
  proto: string
}

type ForwardHeaderKeys = keyof ForwardHeaders

const inc = [
  /**
   * WebSocket requests must have the `GET` method and the `upgrade:websocket` header
   */
  function (req: ProxyRequest, socket: Socket) {
    if (req.method !== 'GET' || !req.headers.upgrade) {
      socket.destroy()
      return
    }

    if (req.headers.upgrade.toLowerCase() !== 'websocket') {
      socket.destroy()
    }
  },

  /**
   * Set the proper configuration for sockets, set no delay and set keep alive, also set the timeout to 0.
   */
  function (req: ProxyRequest, socket: Socket) {
    socket.setTimeout(0)
    socket.setNoDelay(true)

    socket.setKeepAlive(true, 0)
  },

  /**
   * Sets `x-forwarded-*` headers if specified in config.
   */
  function (req: ProxyRequest /*, socket: Socket, options: Option */) {
    const values: ForwardHeaders = {
      for: req.connection.remoteAddress || req.socket.remoteAddress,
      port: req.connection.remotePort || req.socket.remotePort,
      proto: req.connection.asIndexedPairs?.().readableLength ? 'wss' : 'ws',
    }
    ;(Object.keys(values) as ForwardHeaderKeys[]).forEach(function (header) {
      const forwardHeader = req.headers[`x-forwarded-${header}`]
      req.headers[`x-forwarded-${header}`] = (forwardHeader || '') + (forwardHeader ? ',' : '') + values[header]
    })
  },

  /**
   * Does the actual proxying. Make the request and upgrade it send the Switching Protocols request and pipe the sockets.
   */
  function (req: ProxyRequest, socket: Socket, options: CreateProxyOptions) {
    socket.on('error', createErrorHandler(socket))

    utils.setupSocket(socket)

    const config = utils.setupOutgoing({}, req, null, options as CreateProxyOptions)

    const proxyReq = (isReqHttps(req) ? https : http).request(config)

    function onError(err: Error & { code: string }) {
      sendWsData(WebSocketMessageType.Error, createErrorMessage(err))
      if (isReqWebSocket(req) && isLocalhost(req) && err.code === 'ENOTFOUND') {
        // WS tried to reconnect but the websocket isn't running yet
        return
      }
    }

    proxyReq.on('error', createErrorHandler(socket))
    proxyReq.on('upgrade', function (proxyRes, proxySocket) {
      proxySocket.on('error', onError)
      utils.setupSocket(proxySocket)
      socket.write('HTTP/1.1 101 Switching Protocols')
      newLine(socket)
      socket.write(
        `${Object.keys(proxyRes.headers)
          .map((i) => `${i}: ${proxyRes.headers[i]}`)
          .join(NEWLINE)}`
      )
      newLine(socket)
      newLine(socket)
      socket.pipe(proxySocket).pipe(socket)
    })
    req.pipe(proxyReq)
  },
] as WSIncomingRequest[]

export const wsIncoming = (req: ProxyRequest, socket: Socket, options: CreateProxyOptions, server: http.Server | https.Server, head: Buffer) =>
  inc.forEach((incomingFn) => incomingFn(req, socket, options, server, head))
