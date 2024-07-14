import type {
  WebSocketMessage,
  WebSocketMessageType,
} from '../../shared/WebSocketMessage'
import { parseWebSocketMessage } from '../../shared/WebSocketMessage'

const url = new URL(location.toString())
url.hash = ''
url.protocol = 'ws'
url.pathname = 'ws'

type ParsedDataHandler<Data = any> = (data: WebSocketMessage<Data>) => void

const registry: Record<string, ParsedDataHandler> = {}

export const registerDataHandler = <Data = any>(
  type: WebSocketMessageType,
  dataHandler: ParsedDataHandler<Data>
) => (registry[type] = dataHandler)

export const socket = new WebSocket(url)
socket.onmessage = (msg: MessageEvent) => {
  const data = parseWebSocketMessage(msg)
  if (typeof data === 'object') {
    registry[data.type]?.(data)
  } else {
    console.warn(`Could not find WebSocket handler for:`, data)
  }
}

export const sendWsData = async (type: WebSocketMessageType, data: any) => {
  socket.send(JSON.stringify({ type, data } as WebSocketMessage))
}

// Connection opened
socket.addEventListener('open', (event) => {
  // socket.send('Hello Server!')
})

socket.addEventListener('error', (error) => {
  console.error({ error })
})
