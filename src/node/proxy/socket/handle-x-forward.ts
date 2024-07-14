import type { ProxyRequest } from '../../server/ProxyRequest'

interface ForwardHeaders {
  for?: string
  port?: number
  proto: string
}

type ForwardHeaderKeys = keyof ForwardHeaders

/**
 * Set `x-forwarded-` headers.
 */
export const handleXForwardHeaders = (req: ProxyRequest /*, socket: Socket, options: Option */) => {
  const values: ForwardHeaders = {
    for: req.connection.remoteAddress || req.socket.remoteAddress,
    port: req.connection.remotePort || req.socket.remotePort,
    proto: req.connection.asIndexedPairs?.().readableLength ? 'wss' : 'ws',
  }
  ;(Object.keys(values) as ForwardHeaderKeys[]).forEach(function (header) {
    const forwardHeader = req.headers[`x-forwarded-${header}`]
    req.headers[`x-forwarded-${header}`] = (forwardHeader || '') + (forwardHeader ? ',' : '') + values[header]
  })
}
