import type { Logger } from '../utils/logger'
import type { UseCache } from 'lopr-shared'

export interface ProxyPortOptions {
  port: number
}

/**
 * Options passed to the CLI
 */
export interface CreateProxyOptions extends ProxyPortOptions {
  proxySSL: boolean | undefined | string | RegExp
}

/**
 * Running options, configured within the application and on server creation
 */
export interface CommonOptions {
  logger: Logger
  cache: UseCache
}

/**
 * Accumulation of all props
 */
export type ServerOptions = CreateProxyOptions & CommonOptions
