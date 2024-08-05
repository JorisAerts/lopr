import process from 'node:process'
import { createProxy } from './proxy'
import { openBrowser } from './utils/open-browser'
import { displayServerInfo } from './server/server-info'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

createProxy().then(({ url, server, logger }) => {
  displayServerInfo({ logger, server })
  if (process.argv.includes('--open')) openBrowser(url)
})
