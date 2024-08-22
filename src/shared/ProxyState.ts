import type { UseCache } from '../node/server/cache'

export interface ProxyState {
  recording: boolean
  cache: UseCache
}
