import type { ServerOptions } from './ServerOptions'
import type { ProxyState } from 'js-proxy-shared'
import { useCache } from './cache'

export interface InternalProxyState extends ProxyState {
  config: ServerOptions
}

export const createInternalState = (options: ServerOptions): InternalProxyState => ({
  config: options,
  recording: true,
  cache: useCache(),
  breakpoints: [],
})

// keys only available in the internal proxy state
// they shouldn't be sent to the client
const exclude = { options: undefined, cache: undefined }

export const toProxyState = (state: InternalProxyState) => ({ ...state, ...exclude })
