import * as handleDataUUID from './handle-data-uuid'
import * as handleDataCert from './handle-data-cert'
import * as handleServerInfo from './handle-server-info'
import * as handleDataState from './handle-state'
import * as handlePreferences from './handle-prefs'
import type { ProxyRequest } from '../../server/ProxyRequest'
import type { ProxyResponse } from '../../server/ProxyResponse'
import type { UrlWithParsedQuery } from 'url'
import type { InternalProxyState } from '../../server/server-state'

const handlers = [handleDataUUID, handleDataCert, handleServerInfo, handleDataState, handlePreferences]

export const handle = (url: UrlWithParsedQuery, req: ProxyRequest, res: ProxyResponse, state: InternalProxyState) => handlers.some(({ handle }) => handle(url, req, res, state))
