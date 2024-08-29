import type { ProxyRequestInfo } from './Request'
import type { ProxyResponseInfo } from './Response'
import type { ProxyRequestHistory } from './ProxyRequestHistory'

export interface UseCache {
  addRequest(info: ProxyRequestInfo, state: ProxyState): void

  addResponse(info: ProxyResponseInfo, state: ProxyState): void

  clear(): void

  state: ProxyRequestHistory
}

export interface ProxyState {
  recording: boolean
  cache: UseCache
  breakpoints: []
}
