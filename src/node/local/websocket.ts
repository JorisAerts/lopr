import type WebSocket from 'ws'
import { WebSocketServer } from 'ws'
import type { WebSocketMessage} from '../../shared/WebSocketMessage';
import { parseWebSocketMessage, WebSocketMessageType } from '../../shared/WebSocketMessage'
import type { InstanceOptions } from '../utils/Options'
import { WEBSOCKET_ROOT } from '../../shared/constants'
import { createErrorHandler, createErrorHandlerFor } from '../../client/utils/logging'
import { createErrorMessage } from '../utils/ws-messages'
import type { ProxyState } from '../../shared/ProxyState'
import { listCertificates } from '../utils/cert-utils'

const instance = {
  wss: undefined as WebSocketServer | undefined,
  ws: [] as WebSocket[],
}

/**
 * Send data to all sockets
 */
export const sendWsData = (type: WebSocketMessageType, data: any) => {
  instance.ws.forEach((ws) => ws.send(JSON.stringify({ type, data } as WebSocketMessage)))
}

export const defineSocketServer = ({ logger, server, onConnect, state }: InstanceOptions & { onConnect?: (...args: any[]) => any; state: ProxyState }) => {
  const wss = new WebSocketServer({ server, path: WEBSOCKET_ROOT })
  instance.wss = wss
    .on('connection', function connection(ws, req) {
      createErrorHandlerFor(ws, req)

      instance.ws.push(
        ws
          .on('error', createErrorHandler(ws))
          .on('open', () => {
            logger.info('WebSocket connection opened.')
          })
          .on('close', (err) => {
            const index = instance.ws.indexOf(ws)
            if (index > -1) instance.ws.splice(index, 1)
            else sendWsData(WebSocketMessageType.Error, createErrorMessage('Failed to remove WebSocket instance', ws))
            if (err) sendWsData(WebSocketMessageType.Error, createErrorMessage(err, ws))
          })
          .on('message', (event: MessageEvent) => {
            const data = parseWebSocketMessage(event)
            if (typeof data === 'object') {
              registry[data.type]?.(data, state)
            } else {
              logger.warn(`Could not find WebSocket handler for:`, data)
            }
          })
      )

      // send "Connection Established", just for fun
      sendWsData(WebSocketMessageType.App, 'Connection Established')
      // send the current server state (is it recording?, breakpoints, ...)
      sendWsData(WebSocketMessageType.State, {
        ...state,
        // don't send the cache and the options
        cache: undefined,
        config: undefined,
      })

      // send generated Certificates
      sendWsData(WebSocketMessageType.Certificate, listCertificates())

      onConnect?.()
    })
    .on('error', createErrorHandler(wss))
}

export const useWebSocketServer = () => {
  return instance.wss!
}

export const useWebSocket = () => {
  return instance.ws!
}

type ParsedDataHandler<Data = any> = (data: WebSocketMessage<Data>, state: ProxyState) => void

const registry: Record<string, ParsedDataHandler> = {}

export const registerDataHandler = <Data = any>(type: WebSocketMessageType, dataHandler: ParsedDataHandler<Data>) => (registry[type] = dataHandler)
