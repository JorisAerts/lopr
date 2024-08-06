import { ServerResponse } from 'http'

/**
 * Extends the default {@link ServerResponse} with a UUID from the {@link ProxyRequest}
 */
export class ProxyResponse extends ServerResponse {
  uuid: string

  constructor(req: ProxyRequest) {
    super(req)
    this.uuid = req.uuid
  }
}
