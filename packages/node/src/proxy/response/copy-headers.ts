import type { ProxyRequest } from '../../server/ProxyRequest'
import type { ProxyResponse } from '../../server/ProxyResponse'
import type { IncomingMessage } from 'http'

/**
 * Copy the headers from the Response to ProxyResponse.
 */
export const copyHeaders = (req: ProxyRequest, res: ProxyResponse, proxyRes: IncomingMessage) => {
  Object.keys(proxyRes.headers)
    .filter((key) => proxyRes.headers[key])
    .forEach((key) => res.setHeader(key, proxyRes.headers[key as keyof typeof proxyRes.headers]!))
}
