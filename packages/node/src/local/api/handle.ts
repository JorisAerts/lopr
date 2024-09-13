import * as handleDataUUID from './handle-data-uuid'
import * as handleDataCert from './handle-data-uuid'
import * as handleDataServerInfo from './handle-server-info'
import * as handleDataState from './handle-state'
import * as handlePreferences from './handle-prefs'
import type { ProxyRequest } from '../../server/ProxyRequest'
import type { ProxyResponse } from '../../server/ProxyResponse'
import type { ServerOptions } from '../../server'
import type { UrlWithParsedQuery } from 'url'

const handlers = [handleDataUUID, handleDataCert, handleDataServerInfo, handleDataState, handlePreferences]

export const handle = (url: UrlWithParsedQuery, req: ProxyRequest, res: ProxyResponse, options: ServerOptions) => {
  for (const handler of handlers) {
    if (handler.handle(url, req, res, options)) return true
  }
  return false
}
