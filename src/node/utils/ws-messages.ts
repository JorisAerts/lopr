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

const transformSrc = <Source>(src?: Source) => {
  if (!src) return src
  if (typeof src === 'object') {
    if ('uuid' in src!) return `${src.uuid}`
    if ('url' in src!) return `${src.url}`
    const name = src?.constructor?.name
    if (name) return name
  } else {
    return `${src}`
  }
}

export const createErrorMessage = <Err, Source>(err: Err, src?: Source) => {
  const data = err
    ? typeof err === 'string' || typeof err === 'number' //
      ? { name: err, message: err }
      : typeof err === 'object' //
        ? { ...err }
        : { message: err }
    : undefined

  return {
    ...timestamp(),
    src: transformSrc(src),
    err: data,
  }
}
