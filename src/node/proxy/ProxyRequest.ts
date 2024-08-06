import { IncomingMessage } from 'http'
import type { Socket } from 'node:net'
import { v4 as uuid } from 'uuid'

/**
 * Extends the default {@link IncomingMessage} with a UUID
 */
export class ProxyRequest extends IncomingMessage {
  uuid: string

  constructor(socket: Socket) {
    super(socket)
    this.uuid = uuid()
  }
}
