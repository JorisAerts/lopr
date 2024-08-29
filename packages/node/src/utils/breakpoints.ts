import type { BreakPoint, ProxyState } from 'js-proxy-shared'
import { isMatch } from 'js-proxy-shared'

/**
 * Determines whether this request needs to be paused
 */
export const isReqPaused = (url: string | undefined, state: ProxyState) => {
  if (!state.breakpoints || !url) return false
  return state.breakpoints.some((breakpoint: BreakPoint) => breakpoint.req && isMatch(url, breakpoint.match))
}
