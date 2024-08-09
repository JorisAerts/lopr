import type { ProxyRequest } from './ProxyRequest'
import type { ProxyResponse } from './ProxyResponse'
import type { IncomingMessage } from 'http'

export interface OutgoingRequest {
  (req: ProxyRequest, res: ProxyResponse, proxyRes: IncomingMessage): void
}

const response = [
  /**
   * If is a HTTP 1.0 request, remove chunk headers
   */
  function (req: ProxyRequest, res: ProxyResponse, proxyRes: IncomingMessage) {
    if (req.httpVersion === '1.0') {
      delete proxyRes.headers['transfer-encoding']
    }
  },

  /**
   * If is a HTTP 1.0 request, set the correct connection header or if connection header not present, then use `keep-alive`
   */
  function (req: ProxyRequest, res: ProxyResponse, proxyRes: IncomingMessage) {
    if (req.httpVersion === '1.0') {
      proxyRes.headers.connection = req.headers.connection || 'close'
    } else if (!proxyRes.headers.connection) {
      proxyRes.headers.connection = req.headers.connection || 'keep-alive'
    }
  },

  /**
   * Copy headers from ProxyResponse to response set each header in response object.
   */
  function (req: ProxyRequest, res: ProxyResponse, proxyRes: IncomingMessage) {
    Object.keys(proxyRes.headers)
      .filter((key) => proxyRes.headers[key])
      .forEach(function (key) {
        res.setHeader(key, proxyRes.headers[key as keyof typeof proxyRes.headers]!)
      })
  },

  /**
   * Set the statusCode from the ProxyResponse
   */
  function (req: ProxyRequest, res: ProxyResponse, proxyRes: IncomingMessage) {
    res.writeHead(proxyRes.statusCode ?? 200, proxyRes.statusMessage)
  },
] as OutgoingRequest[]

export const outgoing = (req: ProxyRequest, res: ProxyResponse, proxyRes: IncomingMessage) => response.forEach((come) => come(req, res, proxyRes))
