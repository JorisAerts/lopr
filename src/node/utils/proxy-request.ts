import type { IncomingMessage } from 'http'
import type { ProxyRequest } from '../../shared/Request'
import { isReqHttps, isReqWebSocket } from '../proxy/utils'

const getProtocol = (req: IncomingMessage) =>
  isReqHttps(req) ? 'https' : isReqWebSocket(req) ? 'ws' : 'http'

export const createProxyRequest = (req: IncomingMessage): ProxyRequest => {
  const url = req.url!
  const host = req.headers.host
  return {
    url: url.startsWith('/') ? `${getProtocol(req)}://${host}${url}` : url,
    headers: req.rawHeaders,
    trailers: req.rawTrailers,
    method: req.method,
    statusCode: req.statusCode,
    contentLength: req.readableLength,
    ts: new Date(),
  }
}
