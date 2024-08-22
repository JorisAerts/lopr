import type { UUID } from './UUID'
import type { ProxyResponseInfo } from './Response'
import type { ProxyRequestInfo } from './Request'

export interface ProxyRequestHistoryItem {
  request: ProxyRequestInfo | undefined
  response: ProxyResponseInfo | undefined
}

export interface ProxyRequestHistory {
  [K: UUID]: ProxyRequestHistoryItem
}
