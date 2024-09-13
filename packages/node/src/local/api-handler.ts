import { sendWsData } from './websocket'
import { parse as parseUrl } from 'url'
import { WebSocketMessageType } from 'lopr-shared'
import { createErrorMessage } from '../utils/ws-messages'
import type { ProxyResponse } from '../server/ProxyResponse'
import type { ProxyRequest } from '../server/ProxyRequest'
import type { ServerOptions } from '../server'
import { handle } from './api'

export const handleApi = (req: ProxyRequest, res: ProxyResponse, options: ServerOptions) => {
  const url = parseUrl(req.url!, true)
  if (!url.pathname?.startsWith('/api')) return false
  try {
    return handle(url, req, res, options)
  } catch (e) {
    sendWsData(WebSocketMessageType.Error, createErrorMessage(e))
  }
}
