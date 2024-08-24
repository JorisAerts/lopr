import type { OutgoingOptions } from '../proxy/utils'
import type { IncomingMessage, ServerResponse } from 'http'
import type { Logger } from '../utils/logger'
import type { UseCache } from 'js-proxy-shared/ProxyState'

/**
 * Options passed to the CLI
 */
export interface CreateProxyOptions {
  port: number
  proxySSL: boolean | undefined | string | RegExp
  map: ((options: OutgoingOptions, req: IncomingMessage, res: ServerResponse | null) => OutgoingOptions) | undefined
}

/**
 * Running options, configured within the application and on server creation
 */
export interface CommonOptions {
  logger: Logger
  cache: UseCache
  breakpoints: []
}

/**
 * Accumulation of all props
 */
export type ServerOptions = CreateProxyOptions & CommonOptions
