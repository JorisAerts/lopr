// https://github.com/nodejitsu/node-http-proxy
import type { IncomingMessage } from 'http'
import * as http from 'http'
import * as https from 'https'
import type * as net from 'net'
import * as utils from './utils'
import type { Option } from './Option'

export default [
  /**
   * WebSocket requests must have the `GET` method and the `upgrade:websocket` header
   */
  function (req: IncomingMessage, socket: net.Socket) {
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
  function (req: IncomingMessage, socket: net.Socket) {
    socket.setTimeout(0)
    socket.setNoDelay(true)

    socket.setKeepAlive(true, 0)
  },

  /**
   * Sets `x-forwarded-*` headers if specified in config.
   */
  function (req: IncomingMessage /*, socket: net.Socket, options: Option */) {
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
   * Does the actual proxying. Make the request and upgrade it
   * send the Switching Protocols request and pipe the sockets.
   *
   * @param {ClientRequest} req Request object
   * @param {Socket} socket
   * @param {Object} options Config object passed to the proxy
   */
  function (req: IncomingMessage, socket: net.Socket, options: Option) {
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
]
