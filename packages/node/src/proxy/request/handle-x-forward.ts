import type { ProxyRequest } from '../../server/ProxyRequest'
import { isReqHttps } from '../utils'

/**
 * Sets `x-forwarded-...` headers.
 */
export const handleXForward = (req: ProxyRequest) => {
  const values = {
    for: /* req.connection.remoteAddress || */ req.socket.remoteAddress,
    port: /* req.connection.remotePort || */ req.socket.remotePort,
    proto: isReqHttps(req) ? 'https' : 'http',
  }
  Object.keys(values)
    .map((header) => `x-forwarded-${header}`)
    .forEach((header) => (req.headers[header] = (req.headers[header] || '') + (req.headers[header] ? ',' : '') + values[header as keyof typeof values]))
}
