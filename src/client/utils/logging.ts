import { sendWsData } from '../../node/local/websocket'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'
import { createErrorMessage } from '../../node/utils/ws-messages'

type LogType = <ErrorType, SourceObject>(error: ErrorType, source?: SourceObject) => unknown

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const warn: LogType = <ErrorType, SourceObject>(message: ErrorType, source?: SourceObject): void => {}

export const createErrorHandler = <ErrorType, Parent>(source?: Parent) =>
  function (err: ErrorType) {
    sendWsData(WebSocketMessageType.Error, createErrorMessage(err, source))
  }

/**
 * Creates error handlers for the given objects.
 * They will send the error to the WebSocket.
 *
 * If no error handler is specified, this would lead to exiting the server process
 */
export const createErrorHandlerFor = (...args: { on: (...args: any[]) => unknown }[]) => {
  args?.forEach((arg) => arg.on('error', createErrorHandler(arg)))
  return args?.[0]
}
