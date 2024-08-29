import type { BreakPoint, ProxyState } from 'js-proxy-shared'
import { isMatch } from 'js-proxy-shared'

const isPaused = (url: string | undefined, type: keyof BreakPoint, state: ProxyState) => {
  if (!state.breakpoints || !url) return false
  return state.breakpoints.some((breakpoint: BreakPoint) => !breakpoint.disabled && breakpoint[type] && isMatch(url, breakpoint.match))
}

/**
 * Determines whether this request needs to be paused
 */
export const isRequestPaused = (url: string | undefined, state: ProxyState) => isPaused(url, 'req', state)

/**
 * Determines whether this response needs to be paused
 */
export const isResponsePaused = (url: string | undefined, state: ProxyState) => isPaused(url, 'res', state)
