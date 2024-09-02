import type { BreakPoint, ProxyState } from 'lopr-shared'
import { isMatch } from 'lopr-shared'
import type { IncomingMessage, ServerResponse } from 'http'
import { extractURLFromRequest } from '../proxy/utils'

const isPaused = (url: URL | string | undefined, type: keyof BreakPoint, state: ProxyState) => {
  if (!state.breakpoints || !url) return false
  return state.breakpoints.some((breakpoint: BreakPoint) => !breakpoint.disabled && breakpoint[type] && isMatch(url, breakpoint.match))
}

/**
 * Determines whether this request needs to be paused
 */
export const isRequestPaused = (req: IncomingMessage, state: ProxyState) => isPaused(extractURLFromRequest(req), 'req', state)

/**
 * Determines whether this response needs to be paused
 */
export const isResponsePaused = (res: ServerResponse, state: ProxyState) => isPaused(extractURLFromRequest(res.req), 'res', state)
