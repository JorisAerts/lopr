import * as readline from 'node:readline'
import { sendWsData } from '../local'
import { WebSocketMessageType } from '../../../shared/src/WebSocketMessage'
import { createErrorMessage } from './ws-messages'

type LogType = <ErrorType, SourceObject>(error: ErrorType, source?: SourceObject) => unknown

export enum LogLevels {
  /**
   * Logs that contain the most detailed messages. These messages may contain sensitive application data. These messages are disabled by default and should never be enabled in a production environment.
   */
  Trace,
  /**
   * Logs that are used for interactive investigation during development. These logs should primarily contain information useful for debugging and have no long-term value.
   */
  Debug,
  /**
   * Logs that track the general flow of the application. These logs should have long-term value.
   */
  Info,
  /**
   * Logs that highlight an abnormal or unexpected event in the application flow, but do not otherwise cause the application execution to stop.
   */
  Warn,
  /**
   * Logs that highlight when the current flow of execution is stopped due to a failure. These should indicate a failure in the current activity, not an application-wide failure.
   */
  Error,
  /**
   * Logs that describe an unrecoverable application or system crash, or a catastrophic failure that requires immediate attention.
   */
  Critical,
  /**
   * Not used for writing log messages. Specifies that a logging category should not write any messages.
   */
  None,
}

export type Logger = {
  clear: () => void

  debug: (...args: unknown[]) => void

  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
}

const Logger: Logger = console

export function clearScreen() {
  const repeatCount = process.stdout.rows - 2
  const blank = repeatCount > 0 ? '\n'.repeat(repeatCount) : ''
  console.log(blank)
  readline.cursorTo(process.stdout, 0, 0)
  readline.clearScreenDown(process.stdout)
}

export const createLogger = (): Logger => {
  return Logger
}

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
