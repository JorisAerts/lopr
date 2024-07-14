import type { Server } from 'http'
import type WebSocket from 'ws'
import { WebSocketServer } from 'ws'
import type { WebSocketMessage } from '../../shared/WebSocketMessage'
import {
  parseWebSocketMessage,
  WebSocketMessageType,
} from '../../shared/WebSocketMessage'

const instance = {
  wss: undefined as WebSocketServer | undefined,
  ws: undefined as WebSocket | undefined,
}

export const sendWsData = (type: WebSocketMessageType, data: any) => {
  instance.ws?.send(JSON.stringify({ type, data } as WebSocketMessage))
}

export const defineSocketServer = (server: Server) => {
  const wss = new WebSocketServer({ server, path: '/ws' })
  wss.on('connection', function connection(ws) {
    sendWsData(WebSocketMessageType.App, 'Connection Established')
    ws.on('message', (msg: MessageEvent) => {
      const data = parseWebSocketMessage(msg)
      if (typeof data === 'object') {
        registry[data.type]?.(data)
      } else {
        console.warn(`Could not find WebSocket handler for:`, data)
      }
    })
    instance.ws = ws
  })
  instance.wss = wss
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
