import { IncomingMessage } from 'http'
import type { Socket } from 'node:net'
import { v4 as uuid } from 'uuid'
import type { UUID } from 'lopr-shared'

/**
 * Extends the default {@link IncomingMessage} with a UUID
 */
export class ProxyRequest extends IncomingMessage {
  uuid: UUID

  constructor(socket: Socket) {
    super(socket)
    this.uuid = uuid() as UUID
  }
}
