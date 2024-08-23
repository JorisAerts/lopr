import type { UseCache } from '../../node/src/server/cache'

export interface ProxyState {
  recording: boolean
  cache: UseCache
}
