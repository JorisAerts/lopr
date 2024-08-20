import { sendWsData } from './websocket'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'
import { createErrorMessage } from '../utils/ws-messages'
import type { ProxyResponse } from '../server/ProxyResponse'
import type { ProxyRequest } from '../server/ProxyRequest'
import { getCachedData } from '../server/cache'
import type { ServerOptions } from '../server'

export const handleApi = (req: ProxyRequest, res: ProxyResponse, options: ServerOptions) => {
  const url = req.url!
  try {
    if ('/api/data' === req.url) {
      getCachedData(options, req.uuid).then((data) => {
        res.end(data)
      })
      return true
    }

    return false
  } catch (e) {
    sendWsData(WebSocketMessageType.Error, createErrorMessage(e))
  }
}
