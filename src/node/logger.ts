import * as readline from 'node:readline'

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
