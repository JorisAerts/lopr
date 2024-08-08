import type { IncomingMessage } from 'http'
import type { UUID } from '../../shared/UUID'
import type { ProxyResponseInfo } from '../../shared/Response'
import type { ProxyRequestInfo } from '../../shared/Request'
import { extractProtocol } from '../proxy/utils'
import type { ProxyRequest } from '../proxy/ProxyRequest'
import type { Timestamped } from '../../shared/Timestamped'

// add a timestamp to the messages
const timestamp = (): Timestamped => ({ ts: new Date() })

export const createProxyRequest = (req: ProxyRequest): ProxyRequestInfo => {
  const url = req.url!
  const host = req.headers.host
  return {
    ...timestamp(),
    uuid: req.uuid,
    url: url.startsWith('/') ? `${extractProtocol(req)}://${host}${url}` : url,
    headers: req.rawHeaders,
    trailers: req.rawTrailers,
    method: req.method,
    statusCode: req.statusCode,
    contentLength: req.readableLength,
  }
}

export const createProxyResponse = (uuid: UUID, res: IncomingMessage, data: unknown): ProxyResponseInfo => {
  return {
    ...timestamp(),
    uuid: uuid,
    headers: res.rawHeaders,
    contentLength: res.readableLength,
    body: data,
  }
}

export const createErrorMessage = <Err>(err: Err) => {
  const data =
    typeof err === 'string' //
      ? { name: err, message: err }
      : typeof err !== 'string' //
        ? { ...err }
        : { message: err }
  return {
    ...timestamp(),
    err: data,
  }
}
