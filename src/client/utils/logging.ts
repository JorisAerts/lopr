import { sendWsData } from '../../node/proxy/websocket'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'
import { createErrorMessage } from '../../node/utils/ws-messages'

type LogType = <ErrorType, SourceObject>(error: ErrorType, source?: SourceObject) => unknown

const error: LogType = <ErrorType, SourceObject>(error: ErrorType, source?: SourceObject): void => {
  // send the error to the websocket
  sendWsData(WebSocketMessageType.Error, createErrorMessage(error, source))
}

const warn: LogType = <ErrorType, SourceObject>(message: ErrorType, source?: SourceObject): void => {}

export const createErrorHandler = <ErrorType, Parent>(source?: Parent) =>
  function (err: ErrorType) {
    sendWsData(WebSocketMessageType.Error, createErrorMessage(error, source))
  }
