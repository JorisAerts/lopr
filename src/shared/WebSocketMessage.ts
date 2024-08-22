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

export const parseWebSocketMessage = <Data = any>(data: MessageEvent) => {
  const str = data instanceof MessageEvent ? (data.data.toString?.() ?? data) : ((data as any).toString?.() ?? data)
  try {
    return JSON.parse(str) as WebSocketMessage<Data>
  } catch {
    return str
  }
}
