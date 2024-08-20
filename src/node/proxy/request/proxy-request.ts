import { handleResponse } from '../response'
import * as http from 'http'
import * as https from 'https'
import { getDecodedIncomingMessageData } from '../../utils/incoming-message'
import { sendWsData } from '../../local'
import { WebSocketMessageType } from '../../../shared/WebSocketMessage'
import { createProxyResponse } from '../../utils/ws-messages'
import type { ProxyRequest } from '../../server/ProxyRequest'
import type { ProxyResponse } from '../../server/ProxyResponse'
import { createErrorHandler } from '../../../client/utils/logging'
import { isReqHttps, setupOutgoingRequestOptions } from '../utils'
import { cacheDir } from '../../utils/temp-dir'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import type { ServerOptions } from '../../server'

/**
 * Pipe to the outgoing pipeline, create the request to the ultimate destination
 */
export const proxyRequest = (req: ProxyRequest, res: ProxyResponse, options: ServerOptions) => {
  const requestOptions = setupOutgoingRequestOptions({}, req, res, options)
  if (requestOptions) {
    const proxyReq = (isReqHttps(req) ? https : http).request(requestOptions, (proxyRes) => {
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

          sendWsData(WebSocketMessageType.ProxyResponse, createProxyResponse((req as ProxyRequest).uuid, proxyRes, data))
        })

      proxyRes.pipe(res)
    })
    proxyReq.on('error', createErrorHandler(proxyReq))
    req.pipe(proxyReq)
  }
}
