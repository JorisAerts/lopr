import type { ServerOptions } from '../../server'
import type { ProxyRequest } from '../../server/ProxyRequest'
import type { ProxyResponse } from '../../server/ProxyResponse'
import { handleDelete } from './handle-delete'
import { handleXForward } from './handle-x-forward'
import { proxyRequest } from './proxy-request'
import type { InternalProxyState } from '../../server/server-state'

export const forwardRequest = (req: ProxyRequest, res: ProxyResponse, options: ServerOptions, state: InternalProxyState) =>
  [
    // prepping...
    handleDelete,
    handleXForward,
    // finally... proxying!
    proxyRequest,
    //
  ].forEach((incomingFn) => incomingFn(req, res, options, state))
