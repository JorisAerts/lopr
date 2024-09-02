import { handleResponse } from '../response'
import * as http from 'http'
import * as https from 'https'
import { getDecodedIncomingMessageData } from '../../utils/incoming-message'
import type { ProxyRequest } from '../../server/ProxyRequest'
import type { ProxyResponse } from '../../server/ProxyResponse'
import { createErrorHandler } from '../../utils/logger'
import { createRequestOptions, isReqHttps } from '../utils'
import { cacheDir } from '../../utils/temp-dir'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import type { ServerOptions } from '../../server'
import { createProxyResponse } from '../../utils/ws-messages'
import { isResponsePaused } from '../../utils/breakpoints'
import type { InternalProxyState } from '../../server/server-state'
import { sendWsData } from '../../local'
import { WebSocketMessageType } from 'lopr-shared'

/**
 * Pipe to the outgoing pipeline, create the request to the ultimate destination
 */
export const proxyRequest = (req: ProxyRequest, res: ProxyResponse, options: ServerOptions, state: InternalProxyState) => {
  const requestOptions = createRequestOptions({}, req, res, options)
  if (requestOptions) {
    const proxyReq = (isReqHttps(req) ? https : http).request(requestOptions, (proxyRes) => {
      const handle = () => {
        handleResponse(req, res, proxyRes)

        // log the response to the websocket
        getDecodedIncomingMessageData(proxyRes)
          .then((b) => Buffer.from(b))
          .then((data) => {
            if (data.length) {
              // write the file
              const cache = cacheDir(options)
              mkdirSync(cache, { recursive: true })
              writeFileSync(join(cache, res.uuid), data)
            }

            options.cache.addResponse(createProxyResponse((req as ProxyRequest).uuid, proxyRes, data), state)
          })
          .catch(createErrorHandler())

        proxyRes.pipe(res)
      }

      // pause the response if a breakpoint is set for this response
      // TODO: move to a breakpoint handler
      if (isResponsePaused(res, state)) {
        // keep track of the paused request
        state.pausedResponses.set(req.uuid, handle)

        sendWsData(WebSocketMessageType.ProxyResponse, { ...createProxyResponse((req as ProxyRequest).uuid, proxyRes), paused: true })
      } else {
        handle()
      }
    })
    proxyReq.on('error', createErrorHandler(proxyReq))
    req.pipe(proxyReq)
  }
}
