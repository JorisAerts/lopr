import { defineStore } from 'pinia'
import { ref } from 'vue'

export const STORE_NAME = 'Proxy'

interface BreakPoint {
  url: URL
}

export const useProxyStore = defineStore(STORE_NAME, () => {
  const breakpoints = ref([] as BreakPoint[])
  return { breakpoints }
})
