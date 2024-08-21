import type { ServerOptions } from '../../server'
import type { ProxyRequest } from '../../server/ProxyRequest'
import type { ProxyResponse } from '../../server/ProxyResponse'
import { handleDelete } from './handle-delete'
import { handleXForward } from './handle-x-forward'
import { proxyRequest } from './proxy-request'

export const forwardRequest = (req: ProxyRequest, res: ProxyResponse, options: ServerOptions) =>
  [
    // prepping...
    handleDelete,
    handleXForward,
    // finally... proxying!
    proxyRequest,
    //
  ].forEach((incomingFn) => incomingFn(req, res, options))
