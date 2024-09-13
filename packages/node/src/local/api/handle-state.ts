import { clearCache } from '../../server/cache'
import type { ProxyRequest } from '../../server/ProxyRequest'
import type { ProxyResponse } from '../../server/ProxyResponse'
import type { ServerOptions } from '../../server'
import type { UrlWithParsedQuery } from 'url'

export const handle = (url: UrlWithParsedQuery, req: ProxyRequest, res: ProxyResponse, options: ServerOptions) => {
  if (url.pathname !== '/api/state') return false

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
