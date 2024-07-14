import type * as http from 'http'
import type * as https from 'https'
import type { Socket } from 'net'
import type { CreateProxyOptions } from '../../server/'
import type { ProxyRequest } from '../../server/ProxyRequest'
import { handleMethod } from './handle-method'
import { setupSocket } from './setup-socket'
import { handleXForwardHeaders } from './handle-x-forward'
import { proxyRequest } from './proxy-request'

export interface WSIncomingRequest {
  (req: ProxyRequest, socket: Socket, options: CreateProxyOptions, server: http.Server | https.Server, head: Buffer): void
}

export const forwardWebSocket = (req: ProxyRequest, socket: Socket, options: CreateProxyOptions, server: http.Server | https.Server, head: Buffer) =>
  (
    [
      // setup & prepping...
      handleMethod,
      setupSocket,
      handleXForwardHeaders,
      // proxy the WebSocket to the ultimate destination
      proxyRequest,
      //
    ] as WSIncomingRequest[]
  ).forEach((incomingFn) => incomingFn(req, socket, options, server, head))
