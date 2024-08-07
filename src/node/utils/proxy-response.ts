import type { IncomingMessage } from 'http'
import type { UUID } from '../../shared/UUID'
import type { ProxyResponseInfo } from '../../shared/Response'

export const createProxyResponse = (
  uuid: UUID,
  res: IncomingMessage,
  data: unknown
): ProxyResponseInfo => {
  const url = res.url!
  const host = res.headers.host
  return {
    uuid: uuid,
    headers: res.rawHeaders,
    contentLength: res.readableLength,
    body: data,
    ts: new Date(),
  }
}
