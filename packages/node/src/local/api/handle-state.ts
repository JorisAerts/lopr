import type { UrlWithParsedQuery } from 'url'
import { clearCache } from '../../server/cache'
import type { ProxyRequest } from '../../server/ProxyRequest'
import type { ProxyResponse } from '../../server/ProxyResponse'
import { responseSuccess } from '../../utils/response-utils'
import { sendWsData } from '../websocket'
import { WebSocketMessageType } from 'lopr-shared'
import { type InternalProxyState, toProxyState } from '../../server/server-state'

export const handle = (url: UrlWithParsedQuery, req: ProxyRequest, res: ProxyResponse, state: InternalProxyState) => {
  if (url.pathname !== '/api/state') return false

  if (url.query.clear !== undefined) {
    handleClear(url, req, res, state)
    return true
  }

  const data = JSON.stringify(state.config.cache.state)
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Content-Length', data.length)
  res.end(data)
  return true
}

const clearLocalCache = (state: InternalProxyState) => {
  state.config.cache.clear()
  clearCache(state.config)
  sendWsData(WebSocketMessageType.State, toProxyState(state))
}

async function handleClear(url: UrlWithParsedQuery, req: ProxyRequest, res: ProxyResponse, state: InternalProxyState) {
  const port = url.query.port
  if (!port) {
    clearLocalCache(state)
    res.end(responseSuccess)
    return true
  }

  // delete the cache from the requested ports
  const ports = (Array.isArray(port) ? port : [port]).map((i) => parseInt(i, 10))
  for (const port of ports) {
    if (port === state.config.port) clearLocalCache(state)
    try {
      // try to clear the cache through a request,
      // because if that proxy is running,
      // it should also clear it's internal state
      await fetch(`http://localhost:${port}/api/state?clear`)
    } catch {
      // proxy probably not running,
      // so proceed with just deleting the cache folder
      clearCache({ port })
    }
  }
  res.end(responseSuccess)
}
