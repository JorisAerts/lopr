import { defineStore } from 'pinia'
import { shallowRef, watch } from 'vue'
import type { UrlMatch } from 'js-proxy-shared'

export const STORE_NAME = 'Proxy'

export interface BreakPoint {
  req: boolean | undefined
  res: boolean | undefined
  match: UrlMatch
  disabled?: true | undefined
}

export const useProxyStore = defineStore(STORE_NAME, () => {
  const breakpoints = shallowRef([] as BreakPoint[])

  watch(
    breakpoints,
    () => {
      // breakpoints have been updated, send to the WS!
      
      console.log('breakpoint changes!', [...breakpoints.value])
    },
    { deep: true }
  )

  return { breakpoints }
})
