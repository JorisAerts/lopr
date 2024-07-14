import type { Server } from 'http'
import type { Server as HttpsServer } from 'https'
import type { Logger } from './logger'

export interface ServerOptions {
  server: Server | HttpsServer
}

export interface LoggerOptions {
  logger: Logger
}

export interface InstanceOptions extends ServerOptions, LoggerOptions {}
