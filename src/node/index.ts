import type { CreateProxyOptions } from './server'
import { createProxy } from './server'
import { openBrowser } from './utils/open-browser'
import { displayServerInfo } from './server/server-info'
import { processCliParams } from './cli'

// allow unsage SSL certificates
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const cliOptions = processCliParams()
const options: Partial<CreateProxyOptions> = {
  port: cliOptions.port ?? 8080,
}

// spin up the proxy server
createProxy(options).then(({ url, server, logger }) => {
  displayServerInfo({ logger, server })
  if (cliOptions.open) openBrowser(url)
})
