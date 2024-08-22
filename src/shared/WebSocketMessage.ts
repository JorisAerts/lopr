export enum WebSocketMessageType {
  App,
  Error,
  ProxyRequest,
  ProxyResponse,
  Certificate,
  Preferences,
  State,
}

export interface WebSocketMessage<Data = unknown> {
  type: WebSocketMessageType
  data: Data
}

export const parseWebSocketMessage = <Data = any>(data: Data) => {
  const str: string = data?.toString?.() ?? ''
  try {
    return JSON.parse(str) as WebSocketMessage<Data>
  } catch {
    return data
  }
}

export const parseWebSocketMessageEvent = <Data = any>(event: MessageEvent) => parseWebSocketMessage<Data>(event.data)
