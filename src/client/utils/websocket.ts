import type { WebSocketMessage, WebSocketMessageType } from '../../shared/WebSocketMessage'
import { parseWebSocketMessage } from '../../shared/WebSocketMessage'
import { WEBSOCKET_ROOT } from '../../shared/constants'

const url = new URL(location.toString())
url.hash = ''
url.protocol = 'ws'
url.pathname = WEBSOCKET_ROOT

type ParsedDataHandler<Data = any> = (data: WebSocketMessage<Data>) => void

const registry: Record<string, ParsedDataHandler> = {}

export const registerDataHandler = <Data = any>(type: WebSocketMessageType, dataHandler: ParsedDataHandler<Data>) => (registry[type] = dataHandler)

let socket = createSocket()

const retryCreate = () => setTimeout(() => (socket = createSocket()), 1000)

function createSocket() {
  const newSocket = new WebSocket(url)
  newSocket.onerror = () => {
    console.info('WebSocket error.')
  }
  newSocket.onmessage = (msg: MessageEvent) => {
    const data = parseWebSocketMessage(msg)
    if (typeof data === 'object') {
      registry[data.type]?.(data)
    } else {
      console.warn(`Could not find WebSocket handler for:`, data)
    }
  }
  newSocket.onclose = () => {
    console.info('WebSocket connection lost, trying to reconnect')
    retryCreate()
  }
  return newSocket
}

export const sendWsData = (type: WebSocketMessageType, data: any) => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, data } as WebSocketMessage))
  } else {
    const prevOpen = socket.onopen
    socket.onopen = (e: Event) => {
      prevOpen?.call(socket, e)
      sendWsData(type, data)
    }
  }
}

// Connection opened
// socket.addEventListener('open', (event) => {})

socket.addEventListener('error', (error) => {
  // console.error({ error })
  // sendWsData(WebSocketMessageType.Error, createErrorMessage(error))
})
