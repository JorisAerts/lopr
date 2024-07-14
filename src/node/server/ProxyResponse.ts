import type { IncomingMessage } from 'http'
import { ServerResponse } from 'http'
import type { UUID } from '../../shared/UUID'
import type { ProxyRequest } from './ProxyRequest'

/**
 * Extends the default {@link ServerResponse} with a UUID from the {@link ProxyRequest}
 */
export class ProxyResponse extends ServerResponse<ProxyRequest> {
  uuid: UUID

  constructor(req: IncomingMessage) {
    super(req as ProxyRequest)
    this.uuid = (req as ProxyRequest).uuid
  }
}
