// https://github.com/nodejitsu/node-http-proxy
import type { IncomingMessage } from 'http'
import * as http from 'http'
import * as https from 'https'
import type { Socket } from 'net'
import * as utils from './utils'
import type { Options } from './Options'

export interface WSIncomingRequest {
  (
    req: IncomingMessage,
    socket: Socket,
    options: Options,
    server: http.Server | https.Server,
    head: Buffer
  ): void
}

const inc = [
  /**
   * WebSocket requests must have the `GET` method and the `upgrade:websocket` header
   */
  function (req: IncomingMessage, socket: Socket) {
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
  function (req: IncomingMessage, socket: Socket) {
    socket.setTimeout(0)
    socket.setNoDelay(true)

    socket.setKeepAlive(true, 0)
  },

  /**
   * Sets `x-forwarded-*` headers if specified in config.
   */
  function (req: IncomingMessage /*, socket: Socket, options: Option */) {
    const values = {
      for: req.connection.remoteAddress || req.socket.remoteAddress,
      port: req.connection.remotePort || req.socket.remotePort,
      proto: req.connection.asIndexedPairs().readableLength ? 'wss' : 'ws',
    }
    Object.keys(values).forEach(function (header) {
      req.headers[`x-forwarded-${header}`] =
        (req.headers[`x-forwarded-${header}`] || '') +
        (req.headers[`x-forwarded-${header}`] ? ',' : '') +
        values[header as keyof typeof values]
    })
  },

  /**
   * Does the actual proxying. Make the request and upgrade it send the Switching Protocols request and pipe the sockets.
   */
  function (req: IncomingMessage, socket: Socket, options: Options) {
    utils.setupSocket(socket)

    const config = utils.setupOutgoing({}, req, null, options)

    const proxyReq = (
      req.connection.asIndexedPairs().readableLength ? https : http
    ).request(config)

    function onError(err: string) {
      console.error(`error in ${req.url}`)
      console.error(err)
    }

    // Error Handler
    proxyReq.on('error', onError)

    proxyReq.on('upgrade', function (proxyRes, proxySocket) {
      proxySocket.on('error', onError)
      utils.setupSocket(proxySocket)
      socket.write('HTTP/1.1 101 Switching Protocols\r\n')
      socket.write(
        `${Object.keys(proxyRes.headers)
          .map(function (i) {
            const v = proxyRes.headers[i]
            return `${i}: ${v}`
          })
          .join('\r\n')}\r\n\r\n`
      )
      socket.pipe(proxySocket).pipe(socket)
    })
    req.pipe(proxyReq)
  },
] as WSIncomingRequest[]

export const wsIncoming = (
  req: IncomingMessage,
  socket: Socket,
  options: Options,
  server: http.Server | https.Server,
  head: Buffer
) => inc.forEach((come) => come(req, socket, options, server, head))
