import { sendWsData } from './websocket'
import { HTTP_HEADER_CONTENT_LENGTH, HTTP_HEADER_CONTENT_TYPE, WebSocketMessageType } from 'lopr-shared'
import { createErrorMessage } from '../utils/ws-messages'
import type { ProxyResponse } from '../server/ProxyResponse'
import type { ProxyRequest } from '../server/ProxyRequest'
import { clearCache, getCachedData } from '../server/cache'
import type { ServerOptions } from '../server'
import { parse as parseUrl } from 'url'
import type { UUID } from 'lopr-shared/UUID'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { certificatesDir, getRootKeyFiles } from '../utils/cert-utils'
import { dirSize } from '../utils/fs'
import { cacheDir } from '../utils/temp-dir'

export const handleApi = (req: ProxyRequest, res: ProxyResponse, options: ServerOptions) => {
  const url = parseUrl(req.url!, true)

  if (!url.pathname?.startsWith('/api')) return false

  try {
    if (url.pathname === '/api/data' && url.query.uuid) {
      getCachedData(options, `${url.query.uuid}` as UUID)
        .then((data) => {
          res.setHeader('Content-Length', data.length)
          res.end(data)
        })
        .catch((err) => {
          res.statusCode = 404
          res.write(err).toString()
        })
      return true
    } else if (url.pathname === '/api/data' && url.query.cert) {
      const cert = url.query.cert === 'root' ? getRootKeyFiles().cert : join(certificatesDir(), `${url.query.cert}.crt`)
      if (!existsSync(cert)) {
        res.statusCode = 404
        res.write('Not Found').toString()
      } else {
        readFile(cert)
          .then((data) => {
            res.setHeader(HTTP_HEADER_CONTENT_LENGTH, data.length)
            res.setHeader(HTTP_HEADER_CONTENT_TYPE, 'application/x-x509-user-cert')
            res.end(data)
          })
          .catch((err) => {
            res.statusCode = 500
            res.write(err?.toString() ?? '')
            res.end()
          })
      }
      return true
    } else if (url.pathname === '/api/state') {
      if (url.query.clear !== undefined) {
        options.cache.clear()
        clearCache(options)
        res.end()
        return true
      }

      const data = JSON.stringify(options.cache.state)
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Length', data.length)
      res.end(data)
      return true
    } else if (url.pathname === '/api/server-info') {
      Promise.all([dirSize(certificatesDir()), dirSize(cacheDir(options))])
        .then(([certSize, cacheSize]) => {
          const data = JSON.stringify({ certSize, cacheSize })
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Content-Length', data.length)
          res.end(data)
        })
        .catch((err) => {
          res.statusCode = 500
          res.write(err?.toString() ?? '')
          res.end()
        })

      return true
    }

    return false
  } catch (e) {
    sendWsData(WebSocketMessageType.Error, createErrorMessage(e))
  }
}
