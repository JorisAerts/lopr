import type { IncomingMessage } from 'http'
import type { ProxyRequestInfo, ProxyResponseInfo, Timestamped, UUID } from 'js-proxy-shared'
import type { ProxyRequest } from '../server/ProxyRequest'
import type * as http from 'node:http'
import { extractProtocol } from '../proxy/utils'

// add a timestamp to the messages
const timestamp = (): Timestamped => ({ ts: new Date() })

const RX_HAS_PROTOCOL = /^\w+:\/\//

export const createProxyRequest = (req: ProxyRequest): ProxyRequestInfo => {
  const reqUrl = req.url!
  const host = req.headers.host
  const url = reqUrl.startsWith('/') ? `${extractProtocol(req)}://${host}${reqUrl}` : reqUrl
  const urlNormal = !RX_HAS_PROTOCOL.test(url) && url.endsWith(':443') ? `https://${url.substring(0, url.lastIndexOf(':'))}` : url
  return {
    ...timestamp(),
    uuid: req.uuid,
    url,
    urlNormal,
    headers: req.rawHeaders,
    trailers: req.rawTrailers,
    method: req.method,
    statusCode: req.statusCode,
    contentLength: req.readableLength,
    paused: req.isPaused(),
  }
}

export const createProxyResponse = (uuid: UUID, res: IncomingMessage, data: Buffer): ProxyResponseInfo => {
  return {
    ...timestamp(),
    uuid,
    headers: res.rawHeaders,
    contentLength: data.length,
    body: data ? 1 : undefined,
  }
}

export const createLocalProxyResponse = (uuid: UUID, headers: http.OutgoingHttpHeaders, data?: string): ProxyResponseInfo => {
  return {
    ...timestamp(),
    uuid,
    headers: Object.entries(headers).flatMap(([k, v]) => (Array.isArray(v) ? [k, v.join(', ')] : [k, `${v}`])),
    contentLength: data?.length ?? 0,
    body: data ? 1 : undefined,
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
      : err instanceof Error
        ? { name: err.name, message: err.message, stacktrace: err.stack?.replace(/\\n/, '\n') }
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
