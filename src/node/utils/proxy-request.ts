import type { IncomingMessage } from 'http'
import type { ProxyRequestInfo } from '../../shared/Request'
import { isReqHttps, isReqWebSocket } from '../proxy/utils'
import type { ProxyRequest } from '../proxy/ProxyRequest'

const getProtocol = (req: IncomingMessage) =>
  isReqHttps(req) ? 'https' : isReqWebSocket(req) ? 'ws' : 'http'

export const createProxyRequest = (req: ProxyRequest): ProxyRequestInfo => {
  const url = req.url!
  const host = req.headers.host
  return {
    uuid: req.uuid,
    url: url.startsWith('/') ? `${getProtocol(req)}://${host}${url}` : url,
    headers: req.rawHeaders,
    trailers: req.rawTrailers,
    method: req.method,
    statusCode: req.statusCode,
    contentLength: req.readableLength,
    ts: new Date(),
  }
}
