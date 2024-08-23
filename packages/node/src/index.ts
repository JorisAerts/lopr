import { createProxyServer, DEFAULT_PORT } from './server'
import { openBrowser } from './utils/open-browser'
import { displayServerInfo } from './server/server-info'
import { processCliParams } from './cli'
import type { CreateProxyOptions } from './server/ServerOptions'

export { createProxyServer }

const cliOptions = processCliParams()
const options: Partial<CreateProxyOptions> = {
  port: cliOptions.port ?? DEFAULT_PORT,
}

// spin up the proxy server
createProxyServer(options).then(({ url, server, logger }) => {
  displayServerInfo({ logger, server })
  if (cliOptions.open) openBrowser(url)
})
