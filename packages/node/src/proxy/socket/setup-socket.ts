import type { Socket } from 'net'
import type { IncomingMessage } from 'http'

/**
 * Set the proper configuration for sockets, set no delay and set keep alive, also set the timeout to 0.
 */
export const setupSocket = (req: IncomingMessage | null | undefined, socket: Socket) => {
  socket.setTimeout(0)
  socket.setNoDelay(true)
  socket.setKeepAlive(true, 0)
  return socket
}
