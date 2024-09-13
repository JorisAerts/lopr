import process from 'node:process'
import type { Logger } from '../utils/logger'
import tui from '../utils/tui'
import { openBrowser } from '../utils/open-browser'
import type { CreateProxyServer } from '../server'

export type CLIOptions = {
  open: boolean
  port: number
}

export const processCliParams = (): Partial<CLIOptions> => {
  const opts: Partial<CLIOptions> = {}

  for (let i = 2, len = process.argv.length; i < len; ++i) {
    switch (process.argv[i]) {
      case '--open':
        opts.open = true
        break

      case '--port': {
        if (process.argv[i + 1]?.startsWith('-')) continue
        const port = process.argv[++i]
        if (port) opts.port = parseInt(process.argv[++i], 10)
        break
      }
    }
  }

  return opts
}

const displayHelp = (logger: Logger) => {
  logger.info(`  press '${tui.tip(`h`)}' for help (this)`)
  logger.info(`  press '${tui.tip(`o`)}' to open in browser`)
  logger.info(`  press '${tui.tip(`q`)}' to quit`)
  logger.info()
}

export const handleREPL = ({ logger, url }: CreateProxyServer) =>
  process.stdin.resume().addListener('data', function(d) {
    const cmd = d.toString().trim()
    if (process.stdout.moveCursor(0, -1)) {
      process.stdout.clearLine(1)
    }

    switch (cmd) {
      case '':
        return
      case 'o':
        return openBrowser(url)
      case 'q':
        return process.exit()

      default:
        return displayHelp(logger)
    }
  })
