import { createProxyServer, DEFAULT_PORT } from './server'
import { openBrowser } from './utils/open-browser'
import { displayServerInfo } from './server/server-info'
import { processCliParams } from './cli'
import type { CreateProxyOptions } from './server/ServerOptions'
import process from 'node:process'

export { createProxyServer }

const cliOptions = processCliParams()
const options: Partial<CreateProxyOptions> = {
  port: cliOptions.port ?? DEFAULT_PORT,
}

// spin up the proxy server
createProxyServer(options).then(({ url, server, logger }) => {
  displayServerInfo({ logger, server })
  if (cliOptions.open) openBrowser(url)

  process.stdin.resume().addListener('data', function (d) {
    const cmd = d.toString().trim()

    process.stdout.moveCursor(0, -1) // up one line
    process.stdout.clearLine(1) // from cursor to endq

    if (cmd === 'q') process.exit()
  })
})
