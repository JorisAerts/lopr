import * as readline from 'node:readline'

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
