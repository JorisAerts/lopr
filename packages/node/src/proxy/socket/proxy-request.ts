import type { ProxyRequest } from '../../server/ProxyRequest'
import type { Socket } from 'node:net'
import type { ServerOptions } from '../../server'
import { createErrorHandler } from '../../utils/logger'
import * as utils from '../utils'
import { isReqHttps, isReqWebSocket } from '../utils'
import * as http from 'http'
import * as https from 'https'
import { createErrorMessage } from '../../utils/ws-messages'
import { WebSocketMessageType } from 'js-proxy-shared'
import { isLocalhost } from '../../utils/is-localhost'
import { sendWsData } from '../../local'
import { newLine } from './newline'
import { NEWLINE } from '../constants'
import { setupSocket } from './setup-socket'

/**
 * Does the actual proxying.
 * Make the request and upgrade it send the Switching Protocols request and pipe the sockets.
 */
export const proxyRequest = (req: ProxyRequest, socket: Socket, options: ServerOptions) => {
  socket.on('error', createErrorHandler(socket))

  setupSocket(null, socket)

  const config = utils.createRequestOptions({}, req, null, options as ServerOptions)
  const proxyReq = (isReqHttps(req) ? https : http).request(config)
  proxyReq.on('error', createErrorHandler(socket))
  proxyReq.on('upgrade', function (proxyRes, proxySocket) {
    proxySocket.on('error', (err: Error & { code: string }) => {
      sendWsData(WebSocketMessageType.Error, createErrorMessage(err))
      if (isReqWebSocket(req) && isLocalhost(req) && err.code === 'ENOTFOUND') {
        // WS tried to reconnect but the websocket isn't running yet
        return
      }
    })
    setupSocket(null, proxySocket)
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
}
