import { defineStore } from 'pinia'
import { ref } from 'vue'

export const STORE_NAME = 'Application'

export const useAppStore = defineStore(STORE_NAME, () => {
  // "Wrap" in the response body view
  const wrapResponseData = ref(false)
  return { wrapResponseData }
})
