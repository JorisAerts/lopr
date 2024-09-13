import * as handleDataUUID from './handle-data-uuid'
import * as handleDataCert from './handle-data-uuid'
import * as handleDataServerInfo from './handle-server-info'
import * as handleDataState from './handle-state'
import * as handlePreferences from './handle-prefs'
import type { ProxyRequest } from '../../server/ProxyRequest'
import type { ProxyResponse } from '../../server/ProxyResponse'
import type { UrlWithParsedQuery } from 'url'
import type { InternalProxyState } from '../../server/server-state'

const handlers = [handleDataUUID, handleDataCert, handleDataServerInfo, handleDataState, handlePreferences]

export const handle = (url: UrlWithParsedQuery, req: ProxyRequest, res: ProxyResponse, state: InternalProxyState) => {
  for (const handler of handlers) {
    if (handler.handle(url, req, res, state)) return true
  }
  return false
}
