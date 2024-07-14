import type { ProxyRequest } from '../../server/ProxyRequest'
import type { ProxyResponse } from '../../server/ProxyResponse'
import type { IncomingMessage } from 'http'
import { isHttp10 } from '../../utils/is-http-1.0'

/**
 * old school HTTP 1.0
 */
export const handleHttp1_0 = (req: ProxyRequest, res: ProxyResponse, proxyRes: IncomingMessage) => {
  if (isHttp10(req)) {
    delete proxyRes.headers['transfer-encoding']
  }
}
