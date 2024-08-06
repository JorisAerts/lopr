// https://github.com/nodejitsu/node-http-proxy
import type * as net from 'node:net'
import type { IncomingMessage, RequestOptions, ServerResponse } from 'http'
import type * as tls from 'node:tls'
import type { CreateProxyOptions } from './proxy'

export type OutgoingOptions = tls.ConnectionOptions & RequestOptions

export function extractURL(req: IncomingMessage) {
  return new URL(
    req.url.startsWith('http')
      ? req.url
      : `http://${req.client.servername}${req.url}`
  )
}

export function setupOutgoing(
  outgoing: Partial<OutgoingOptions>,
  req: IncomingMessage,
  res: ServerResponse | null,
  options: CreateProxyOptions
): OutgoingOptions {
  const urlObj = extractURL(req)

  //console.log('  => ', { isHttps: isReqHttps(req), urlObj: urlObj.toString() })

  const isHttps = isReqHttps(req)
  const headers = req.headers
  outgoing.port = isHttps ? 443 : +urlObj.port || 80
  outgoing.host = urlObj.hostname || headers.host
  outgoing.method = req.method
  outgoing.path = urlObj.pathname
  outgoing.rejectUnauthorized = false
  outgoing.headers = headers
  if (options.map) {
    outgoing = (options.map as Exclude<CreateProxyOptions['map'], undefined>)(
      outgoing,
      req,
      res
    )
  }
  return outgoing
}

export function isReqWebSocket(req: IncomingMessage): boolean {
  return (
    req.headers.origin?.startsWith('ws://') ||
    req.headers.upgrade === 'websocket'
  )
}

export function isReqHttps(req: IncomingMessage): boolean {
  return !!(
    req.connection.encrypted ||
    req.socket.encrypted ||
    (req as any).isSpdy ||
    req.socket?.asIndexedPairs?.().readableLength ||
    extractURL(req).port === '443'
  )
}

/**
 * Set the proper configuration for sockets, set no delay and set keep alive, also set the timeout to 0.
 */
export function setupSocket(socket: net.Socket) {
  socket.setTimeout(0)
  socket.setNoDelay(true)
  socket.setKeepAlive(true, 0)
  return socket
}
