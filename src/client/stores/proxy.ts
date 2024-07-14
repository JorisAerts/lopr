import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UrlMatch } from '../../shared/url-match'

export const STORE_NAME = 'Proxy'

interface BreakPoint {
  req: boolean
  res: boolean
  match: UrlMatch
}

export const useProxyStore = defineStore(STORE_NAME, () => {
  const breakpoints = ref([] as BreakPoint[])
  return { breakpoints }
})
