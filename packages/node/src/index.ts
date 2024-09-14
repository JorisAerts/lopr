import type { CreateProxyOptions } from './server/ServerOptions'
import { createProxyServer, DEFAULT_PORT } from './server'
import { openBrowser } from './utils/open-browser'
import { displayServerInfo, handleREPL, processCliParams } from './cli'

export { createProxyServer }

const cliOptions = processCliParams()
const options: Partial<CreateProxyOptions> = {
  port: cliOptions.port ?? DEFAULT_PORT,
}

// spin up the proxy server
createProxyServer(options).then((serverInfo) => {
  const { url, server, logger } = serverInfo

  // display server stats
  displayServerInfo({ logger, server })

  // open the browser if specified
  if (cliOptions.open) openBrowser(url)

  // handle user input
  handleREPL(serverInfo)
})
