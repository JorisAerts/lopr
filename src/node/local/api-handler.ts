import { sendWsData } from './websocket'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'
import { createErrorMessage } from '../utils/ws-messages'
import type { ProxyResponse } from '../server/ProxyResponse'
import type { ProxyRequest } from '../server/ProxyRequest'
import { getCachedData } from '../server/cache'
import type { ServerOptions } from '../server'
import { parse as parseUrl } from 'url'
import type { UUID } from '../../shared/UUID'

export const handleApi = (req: ProxyRequest, res: ProxyResponse, options: ServerOptions) => {
  const url = parseUrl(req.url!, true)
  try {
    if (url.path === '/api' && url.query.uuid) {
      getCachedData(options, `${url.query.uuid}` as UUID).then((data) => {
        res.end(data)
      })
      return true
    }

    return false
  } catch (e) {
    sendWsData(WebSocketMessageType.Error, createErrorMessage(e))
  }
}
