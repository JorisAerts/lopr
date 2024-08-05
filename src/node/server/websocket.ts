import type WebSocket from 'ws'
import { WebSocketServer } from 'ws'
import type { WebSocketMessage } from '../../shared/WebSocketMessage'
import {
  parseWebSocketMessage,
  WebSocketMessageType,
} from '../../shared/WebSocketMessage'
import type { InstanceOptions } from '../utils/Options'
import { WEBSOCKET_ROOT } from '../../shared/constants'

const instance = {
  wss: undefined as WebSocketServer | undefined,
  ws: undefined as WebSocket | undefined,
}

export const sendWsData = (type: WebSocketMessageType, data: any) => {
  instance.ws?.send(JSON.stringify({ type, data } as WebSocketMessage))
}

export const defineSocketServer = ({ logger, server }: InstanceOptions) => {
  const wss = new WebSocketServer({ server, path: WEBSOCKET_ROOT })
  instance.wss = wss.on('connection', function connection(ws) {
    sendWsData(WebSocketMessageType.App, 'Connection Established')
    instance.ws = ws
      .on('message', (msg: MessageEvent) => {
        const data = parseWebSocketMessage(msg)
        if (typeof data === 'object') {
          registry[data.type]?.(data)
        } else {
          logger.warn(`Could not find WebSocket handler for:`, data)
        }
      })
      .on('error', (err: Error) => {})
      .on('open', () => {
        logger.info('Websocket connection opened.')
      })
      .on('close', (err: Error) => {
        console.info('Websocket connection lost', err)
      })
  })
}

export const useWebSocketServer = () => {
  return instance.wss!
}

export const useWebSocket = () => {
  return instance.ws!
}

type ParsedDataHandler<Data = any> = (data: WebSocketMessage<Data>) => void

const registry: Record<string, ParsedDataHandler> = {}

export const registerDataHandler = <Data = any>(
  type: WebSocketMessageType,
  dataHandler: ParsedDataHandler<Data>
) => (registry[type] = dataHandler)
