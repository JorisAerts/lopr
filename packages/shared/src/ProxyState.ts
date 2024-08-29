import type { ProxyRequestInfo } from './Request'
import type { ProxyResponseInfo } from './Response'
import type { ProxyRequestHistory } from './ProxyRequestHistory'
import type { UrlMatch } from './url-match'

export interface UseCache {
  addRequest(info: ProxyRequestInfo, state: ProxyState): void

  addResponse(info: ProxyResponseInfo, state: ProxyState): void

  clear(): void

  state: ProxyRequestHistory
}

export interface BreakPoint {
  req: boolean | undefined
  res: boolean | undefined
  match: UrlMatch
  disabled?: true | undefined
}

export interface ProxyState {
  recording: boolean
  cache: UseCache
  breakpoints: BreakPoint[]
}
