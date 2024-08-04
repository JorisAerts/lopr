// https://github.com/nodejitsu/node-http-proxy
import outgoing from './outgoing'
import type { IncomingMessage, ServerResponse } from 'http'
import * as http from 'http'
import * as https from 'https'
import type { Option } from './Option'
import { isReqHttps, setupOutgoing } from './utils'

export default [
  /**
   * Sets `content-length` to '0' if request is of DELETE type.
   */
  function (req: http.ClientRequest) {
    if (req.method === 'DELETE' && !req.hasHeader('content-length')) {
      req.setHeader('content-length', '0')
    }
  },

  /**
   * Sets `x-forwarded-*` headers if specified in config.
   */
  function (req: IncomingMessage) {
    const values = {
      for: req.connection.remoteAddress || req.socket.remoteAddress,
      port: req.connection.remotePort || req.socket.remotePort,
      proto: isReqHttps(req) ? 'https' : 'http',
    }

    Object.keys(values).forEach((header) => {
      req.headers[`x-forwarded-${header}`] =
        (req.headers[`x-forwarded-${header}`] || '') +
        (req.headers[`x-forwarded-${header}`] ? ',' : '') +
        values[header as keyof typeof values]
    })
  },

  function (req: IncomingMessage, res: ServerResponse, option: Option) {
    const isHttps = isReqHttps(req)

    function response(proxyRes: IncomingMessage) {
      outgoing.forEach(function (go) {
        go(req, res, proxyRes)
      })
      proxyRes.pipe(res)
    }

    function onError(err: string) {
      console.error(`error in ${req.url}`)
      console.error(err)
    }

    const outConfig = setupOutgoing({}, req, res, option)

    if (outConfig) {
      const proxyReq = (isHttps ? https : http).request(outConfig, response)
      proxyReq.on('error', onError)
      req.pipe(proxyReq)
    }
  },
]
