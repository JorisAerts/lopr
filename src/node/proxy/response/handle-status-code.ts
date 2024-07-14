import type { ProxyRequest } from '../../server/ProxyRequest'
import type { ProxyResponse } from '../../server/ProxyResponse'
import type { IncomingMessage } from 'http'

/**
 * Set the status code from the ProxyResponse
 */
export const handleWriteStatusCode = (
  req: ProxyRequest,
  res: ProxyResponse,
  proxyRes: IncomingMessage //
) => res.writeHead(proxyRes.statusCode ?? 200, proxyRes.statusMessage)
