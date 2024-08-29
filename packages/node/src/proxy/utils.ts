import type tls from 'node:tls'
import type { IncomingMessage, RequestOptions, ServerResponse } from 'http'
import type { ServerOptions } from '../server'
import { URL } from 'node:url'

export type OutgoingOptions = tls.ConnectionOptions & RequestOptions

export const isReqWebSocket = (req: IncomingMessage): boolean => {
  return req.headers.origin?.startsWith('ws://') || req.headers.upgrade === 'websocket'
}

export const isReqHttps = (req: IncomingMessage): boolean => {
  return !!(
    ((req.connection as any).encrypted || (req.socket as any).encrypted || (req as any).isSpdy || req.socket?.asIndexedPairs?.().readableLength)
    // || extractURL(req).port === '443'
  )
}

const RX_PROTOCOL = /^[a-z]+:\/\//i

export const extractProtocol = (req: IncomingMessage) => {
  const secure = isReqHttps(req)
  return isReqWebSocket(req) ? (secure ? 'wss' : 'ws') : secure ? 'https' : 'http'
}

export const extractURLFromRequest = (req: IncomingMessage) => {
  return new URL(RX_PROTOCOL.test(req.url!) ? req.url! : `${extractProtocol(req)}://${req.headers.host /*?? req.client.servername*/}${req.url ?? ''}`)
}

export const createRequestOptions = (outgoing: Partial<OutgoingOptions>, req: IncomingMessage, res: ServerResponse | null, options: ServerOptions): OutgoingOptions => {
  const url = extractURLFromRequest(req)
  return Object.assign(outgoing, {
    port: isReqHttps(req) ? 443 : +url.port || 80,
    host: url.hostname || req.headers.host,
    method: req.method,
    path: url.pathname + (url.search || ''),
    rejectUnauthorized: false,
    headers: req.headers,
  })
}
