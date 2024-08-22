import type { UUID } from './UUID'
import type { ProxyResponseInfo } from './Response'
import type { ProxyRequestInfo } from './Request'

export type ProxyStateItem = {
  request: ProxyRequestInfo | undefined
  response: ProxyResponseInfo | undefined
}

export type ProxyRequestHistory = {
  [K: UUID]: ProxyStateItem
}
