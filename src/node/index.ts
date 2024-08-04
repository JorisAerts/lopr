import { start } from './proxy/old/proxy'
import process from 'node:process'
import { openBrowser } from './utils/open-browser'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

start().then((address) => {
  if (process.argv.includes('--open')) openBrowser(address)
})
