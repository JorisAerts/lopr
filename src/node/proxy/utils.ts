// https://github.com/nodejitsu/node-http-proxy
import type * as net from 'node:net'
import type { IncomingMessage, RequestOptions, ServerResponse } from 'http'
import type { Options } from './Options'
import type * as tls from 'node:tls'

type OutgoingOptions = tls.ConnectionOptions & RequestOptions

export function setupOutgoing(
  outgoing: Partial<OutgoingOptions>,
  req: IncomingMessage,
  res: ServerResponse | null,
  option: Options
): OutgoingOptions {
  const urlObj = new URL(req.url!)
  const isHttps = isReqHttps(req)
  const headers = req.headers
  outgoing.port = isHttps ? 443 : +urlObj.port || 80
  outgoing.host = urlObj.hostname || headers.host
  outgoing.method = req.method
  outgoing.path = urlObj.pathname
  outgoing.rejectUnauthorized = false
  outgoing.headers = headers
  if (option.map) {
    outgoing = option.map(outgoing, req, res)
  }
  return outgoing
}

export function isReqHttps(req: IncomingMessage): boolean {
  return (
    new URL(`http://${req.url}`).port === '443' ||
    (req as any).isSpdy ||
    req.socket?.asIndexedPairs?.().readableLength
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
