import type { IncomingMessage } from 'http'
import type { ProxyRequest } from '../../shared/Request'

export const createProxyRequest = (req: IncomingMessage): ProxyRequest => {
  const url = req.url!
  return {
    url: url.startsWith('/') ? `${req.headers.host  }/${  url}` : url,
    headers: req.rawHeaders,
    trailers: req.rawTrailers,
    method: req.method,
    statusCode: req.statusCode,
    contentLength: req.readableLength,
    ts: new Date(),
  }
}
