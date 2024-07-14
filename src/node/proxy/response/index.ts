import type { ProxyRequest } from '../../server/ProxyRequest'
import type { ProxyResponse } from '../../server/ProxyResponse'
import type { IncomingMessage } from 'http'
import { handleHttp1_0 } from './handle-http-1.0'
import { handleConnection } from './handle-connection'
import { copyHeaders } from './copy-headers'
import { handleWriteStatusCode } from './handle-status-code'

export const handleResponse = (req: ProxyRequest, res: ProxyResponse, proxyRes: IncomingMessage) =>
  [
    // prepare some headers
    handleHttp1_0,
    handleConnection,
    copyHeaders,
    // write the status
    handleWriteStatusCode,
    // (output was already piped by the request handler)
  ].forEach((outgoingFn) => outgoingFn(req, res, proxyRes))
