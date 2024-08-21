import { sendWsData } from './websocket'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'
import { createErrorMessage } from '../utils/ws-messages'
import type { ProxyResponse } from '../server/ProxyResponse'
import type { ProxyRequest } from '../server/ProxyRequest'
import { clearCache, getCachedData } from '../server/cache'
import type { ServerOptions } from '../server'
import { parse as parseUrl } from 'url'
import type { UUID } from '../../shared/UUID'

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
    }

    return false
  } catch (e) {
    sendWsData(WebSocketMessageType.Error, createErrorMessage(e))
  }
}
