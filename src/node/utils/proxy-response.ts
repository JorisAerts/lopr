import type { IncomingMessage } from 'http'
import type { UUID } from '../../shared/UUID'
import type { ProxyResponseInfo } from '../../shared/Response'

export const createProxyResponse = (uuid: UUID, res: IncomingMessage, data: unknown): ProxyResponseInfo => {
  return {
    uuid: uuid,
    headers: res.rawHeaders,
    contentLength: res.readableLength,
    body: data,
    ts: new Date(),
  }
}
