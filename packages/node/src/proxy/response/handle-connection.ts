import type { ProxyRequest } from '../../server/ProxyRequest'
import type { ProxyResponse } from '../../server/ProxyResponse'
import type { IncomingMessage } from 'http'
import { isHttp10 } from '../../utils/is-http-1.0'

/**
 * If it's an HTTP 1.0 request, set the correct connection header,
 * or if connection header not present, then use `keep-alive`
 */
export const handleConnection = (req: ProxyRequest, res: ProxyResponse, proxyRes: IncomingMessage) => {
  if (isHttp10(req)) {
    proxyRes.headers.connection = req.headers.connection || 'close'
  } else if (!proxyRes.headers.connection) {
    proxyRes.headers.connection = req.headers.connection || 'keep-alive'
  }
}
