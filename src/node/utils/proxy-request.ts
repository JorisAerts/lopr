import type { ProxyRequestInfo } from '../../shared/Request'
import { extractProtocol } from '../proxy/utils'
import type { ProxyRequest } from '../proxy/ProxyRequest'

export const createProxyRequest = (req: ProxyRequest): ProxyRequestInfo => {
  const url = req.url!
  const host = req.headers.host
  return {
    uuid: req.uuid,
    url: url.startsWith('/') ? `${extractProtocol(req)}://${host}${url}` : url,
    headers: req.rawHeaders,
    trailers: req.rawTrailers,
    method: req.method,
    statusCode: req.statusCode,
    contentLength: req.readableLength,
    ts: new Date(),
  }
}
