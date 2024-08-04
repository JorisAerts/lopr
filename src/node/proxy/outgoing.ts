import type { IncomingMessage, ServerResponse } from 'http'
// https://github.com/nodejitsu/node-http-proxy

export default [
  /**
   * If is a HTTP 1.0 request, remove chunk headers
   */
  function (
    req: IncomingMessage,
    res: ServerResponse,
    proxyRes: IncomingMessage
  ) {
    if (req.httpVersion === '1.0') {
      delete proxyRes.headers['transfer-encoding']
    }
  },

  /**
   * If is a HTTP 1.0 request, set the correct connection header or if connection header not present, then use `keep-alive`
   */
  function (
    req: IncomingMessage,
    res: ServerResponse,
    proxyRes: IncomingMessage
  ) {
    if (req.httpVersion === '1.0') {
      proxyRes.headers.connection = req.headers.connection || 'close'
    } else if (!proxyRes.headers.connection) {
      proxyRes.headers.connection = req.headers.connection || 'keep-alive'
    }
  },

  /**
   * Copy headers from ServerResponse to response set each header in response object.
   */
  function (
    req: IncomingMessage,
    res: ServerResponse,
    proxyRes: IncomingMessage
  ) {
    Object.keys(proxyRes.headers)
      .filter((key) => proxyRes.headers[key])
      .forEach(function (key) {
        res.setHeader(
          key,
          proxyRes.headers[key as keyof typeof proxyRes.headers]!
        )
      })
  },

  /**
   * Set the statusCode from the ServerResponse
   */
  function (
    req: IncomingMessage,
    res: ServerResponse,
    proxyRes: IncomingMessage
  ) {
    res.writeHead(proxyRes.statusCode ?? 200, proxyRes.statusMessage)
  },
]
