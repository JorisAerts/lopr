export enum WebSocketMessageType {
  App,
  Error,
  ProxyRequest,
  ProxyResponse,
  Certificate,
  Preferences,
}

export interface WebSocketMessage<Data = unknown> {
  type: WebSocketMessageType
  data: Data
}

export const parseWebSocketMessage = <Data = any>(data: MessageEvent) => {
  try {
    return JSON.parse(data.data) as WebSocketMessage<Data>
  } catch (e) {
    return data.data as string
  }
}
