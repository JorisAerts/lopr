import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UrlMatch } from 'js-proxy-shared'

export const STORE_NAME = 'Proxy'

export interface BreakPoint {
  req: boolean | undefined
  res: boolean | undefined
  match: UrlMatch
  disabled?: true
}

export const useProxyStore = defineStore(STORE_NAME, () => {
  const breakpoints = ref([] as BreakPoint[])
  return { breakpoints }
})
