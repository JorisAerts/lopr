import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useLocalStore } from './local'

export const STORE_NAME = 'Preferences'

export const usePreferencesStore = defineStore(STORE_NAME, () => {
  const localStore = useLocalStore()

  const sslProxy = computed<boolean>({
    get: () => localStore.sslProxy,
    set: (value) => (localStore.sslProxy = value),
  })

  return { sslProxy }
})
