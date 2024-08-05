import process from 'node:process'
import { createProxy } from './proxy'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

/*
start().then((address) => {
  if (process.argv.includes('--open')) openBrowser(address)
})
*/

createProxy()
