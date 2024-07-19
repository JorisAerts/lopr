import type { Server } from 'http'
import type { Logger } from '../logger'

export interface ServerOptions {
  server: Server
}

export interface LoggerOptions {
  logger: Logger
}

export interface InstanceOptions extends ServerOptions, LoggerOptions {}
