import type { ProxyRequest } from '../../server/ProxyRequest'
import type { Socket } from 'node:net'

/**
 * WebSocket requests must have the `GET` method and the `upgrade:websocket` header
 */
export const handleMethod = (req: ProxyRequest, socket: Socket) => {
  if (req.method !== 'GET' || !req.headers.upgrade) {
    socket.destroy()
    return
  }

  if (req.headers.upgrade.toLowerCase() !== 'websocket') {
    socket.destroy()
  }
}
