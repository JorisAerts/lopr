import type { UrlWithParsedQuery } from 'url'
import { clearCache } from '../../server/cache'
import type { ProxyRequest } from '../../server/ProxyRequest'
import type { ProxyResponse } from '../../server/ProxyResponse'
import type { ServerOptions } from '../../server'
import { responseSuccess } from '../../utils/response-utils'

export const handle = (url: UrlWithParsedQuery, req: ProxyRequest, res: ProxyResponse, options: ServerOptions) => {
  if (url.pathname !== '/api/state') return false

  if (url.query.clear !== undefined) {
    handleClear(url, req, res, options)
    return true
  }

  const data = JSON.stringify(options.cache.state)
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Content-Length', data.length)
  res.end(data)
  return true
}

const clearLocalCache = (options: ServerOptions) => {
  options.cache.clear()
  clearCache(options)
}

async function handleClear(url: UrlWithParsedQuery, req: ProxyRequest, res: ProxyResponse, options: ServerOptions) {
  const port = url.query.port
  if (!port) {
    clearLocalCache(options)
    res.end(responseSuccess)
    return true
  }

  // delete the cache from the requested ports
  const ports = (Array.isArray(port) ? port : [port]).map((i) => parseInt(i, 10))
  for (const port of ports) {
    if (port === options.port) clearLocalCache(options)
    try {
      await fetch(`http://localhost:${port}/api/state?clear`)
    } catch {
      clearCache({ port })
    }
  }
  res.end(responseSuccess)
}
