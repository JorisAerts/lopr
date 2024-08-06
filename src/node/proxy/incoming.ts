import { outgoing } from './outgoing'
import type { IncomingMessage, ServerResponse } from 'http'
import * as http from 'http'
import * as https from 'https'
import { isReqHttps, setupOutgoing } from './utils'
import type { CreateProxyOptions } from './proxy'

export interface IncomingRequest {
  (req: IncomingMessage, res: ServerResponse, options: CreateProxyOptions): void
}

const inc = [
  /**
   * Sets `content-length` to '0' if request is of DELETE type.
   */
  function (req: IncomingMessage) {
    if (req.method === 'DELETE' && !req.headers['content-length']) {
      req.headers['content-length'] = '0'
    }
  },

  /**
   * Sets `x-forwarded-*` headers if specified in config.
   */
  function (req: IncomingMessage) {
    const values = {
      for: /* req.connection.remoteAddress || */ req.socket.remoteAddress,
      port: /* req.connection.remotePort || */ req.socket.remotePort,
      proto: isReqHttps(req) ? 'https' : 'http',
    }
    Object.keys(values)
      .map((header) => `x-forwarded-${header}`)
      .forEach((header) => {
        req.headers[header] =
          (req.headers[header] || '') +
          (req.headers[header] ? ',' : '') +
          values[header as keyof typeof values]
      })
  },

  /**
   * Pipe to the outgoing pipeline
   */
  function (
    req: IncomingMessage,
    res: ServerResponse,
    options: CreateProxyOptions
  ) {
    function response(proxyRes: IncomingMessage) {
      outgoing(req, res, proxyRes)
      proxyRes.pipe(res)
    }

    function onError(err: string) {
      console.error(`error in ${req.url}`)
      console.error(err)
    }

    const requestOptions = setupOutgoing({}, req, res, options)
    if (requestOptions) {
      const proxyReq = (isReqHttps(req) ? https : http).request(
        requestOptions,
        response
      )
      proxyReq.on('error', onError)
      req.pipe(proxyReq)
    }
  },
] as IncomingRequest[]

export const incoming = (
  req: IncomingMessage,
  res: ServerResponse,
  options: CreateProxyOptions
) => inc.forEach((come) => come(req, res, options))
