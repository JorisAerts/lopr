import type { WebSocketMessage, WebSocketMessageType, WebSocketMessageTypeDataMapping } from 'lopr-shared'
import { parseWebSocketMessageEvent, WEBSOCKET_ROOT } from 'lopr-shared'
import { RouteNames } from '../router/RouteNames'
import { router } from '../router'

const url = new URL(location.toString())
url.hash = ''
url.protocol = 'ws'
url.pathname = WEBSOCKET_ROOT

type ParsedDataHandler<Data = any> = (data: WebSocketMessage<Data>) => void

const registry: Record<string, ParsedDataHandler> = {}

export const registerDataHandler = <Data = any>(type: WebSocketMessageType, dataHandler: ParsedDataHandler<Data>) => (registry[type] = dataHandler)

const MAX_RETRY_CREATE = 10
let socket = createSocket()
const retryCreate = (() => {
  let timeOut: number
  return (count: number) => {
    window.clearTimeout(timeOut)
    if (count >= 0) timeOut = window.setTimeout(() => (socket = createSocket(count)), 1000)
  }
})()

function socketDown() {
  if (router.currentRoute.value.name !== RouteNames.ErrorWsDown) {
    router.push({ name: RouteNames.ErrorWsDown, replace: false })
  }
}

function createSocket(retryCount = MAX_RETRY_CREATE) {
  if (retryCount <= 0) {
    return socketDown()
  }
  const newSocket = new WebSocket(url)
  newSocket.onerror = (e) => {
    console.info('WebSocket error.', e)
  }
  newSocket.onmessage = (event: MessageEvent) => {
    const data = parseWebSocketMessageEvent(event)
    if (typeof data === 'object') {
      registry[data.type]?.(data)
    } else {
      console.warn(`Could not find WebSocket handler for:`, data)
    }
  }
  newSocket.onclose = () => {
    console.info('WebSocket connection lost, trying to reconnect')
    retryCreate(--retryCount)
  }
  return newSocket
}

export const sendWsData = <Type extends WebSocketMessageType>(type: Type, data: WebSocketMessageTypeDataMapping<typeof type>) => {
  if (!socket) return socketDown()
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, data } as WebSocketMessage))
  } else {
    const prevOpen = socket.onopen
    socket.onopen = (e: Event) => {
      prevOpen?.call(socket!, e)
      sendWsData(type, data)
    }
  }
}
