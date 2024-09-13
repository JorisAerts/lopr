import { sendWsData } from './websocket'
import { parse as parseUrl } from 'url'
import { WebSocketMessageType } from 'lopr-shared'
import { createErrorMessage } from '../utils/ws-messages'
import type { ProxyResponse } from '../server/ProxyResponse'
import type { ProxyRequest } from '../server/ProxyRequest'
import { handle } from './api'
import type { InternalProxyState } from '../server/server-state'

export const handleApi = (req: ProxyRequest, res: ProxyResponse, state: InternalProxyState) => {
  const url = parseUrl(req.url!, true)
  if (!url.pathname?.startsWith('/api')) return false
  try {
    return handle(url, req, res, state)
  } catch (e) {
    sendWsData(WebSocketMessageType.Error, createErrorMessage(e))
  }
}
