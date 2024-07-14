import type { Logger } from '../logger'
import { clearScreen } from '../logger'
import type { Server } from 'http'
import { APP_NAME } from '../../shared/constants'
import { packageJson } from '../utils/package'
import tui from '../utils/tui'

interface ServerInfoOptions {
  logger: Logger
  server: Server
}

const getAddress = (server: Server) => {
  const address = server.address()
  if (!address) return '?'
  if (typeof address === 'string') return address
  return `http://localhost:${address.port}`
}

export const displayServerInfo = ({ logger, server }: ServerInfoOptions) => {
  const title = `${APP_NAME} - ${packageJson.version}`
  clearScreen()
  logger.info()
  logger.info(`  ${tui.title(title)}`)
  logger.info()
  logger.info(
    `  ${tui.tooltip(`GUI & Proxy Server: ${tui.link(getAddress(server))}`)}`
  )
  logger.info(
    `  ${tui.tooltip(`Use ${tui.tip('--open')} to automatically open your browser.`)}`
  )
  logger.info()
}
