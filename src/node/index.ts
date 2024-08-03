import { start } from './proxy/proxy3'
import process from 'node:process'
import { openBrowser } from './utils/open-browser'

start().then((address) => {
  if (process.argv.includes('--open')) openBrowser(address)
})
