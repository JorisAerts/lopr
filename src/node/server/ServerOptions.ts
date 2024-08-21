import type { OutgoingOptions } from '../proxy/utils'
import type { IncomingMessage, ServerResponse } from 'http'
import type { Logger } from '../utils/logger'

/**
 * Options passed to the CLI
 */
export interface CreateProxyOptions {
  port: number
  proxySSL: boolean | undefined | string | RegExp
  map: ((options: OutgoingOptions, req: IncomingMessage, res: ServerResponse | null) => OutgoingOptions) | undefined
}

interface ProxyOptions {
  cache: any
  breakpoints: []
}

/**
 * Running options, configured within the application and on server creation
 */
export interface CommonOptions {
  logger: Logger

  //proxy: any
}

/**
 * Accumulation of all props
 */
export type ServerOptions<Options extends Partial<CreateProxyOptions> = {}> = CreateProxyOptions & CommonOptions & Options
