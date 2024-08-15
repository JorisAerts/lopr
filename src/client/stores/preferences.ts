import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { computed, reactive, watch } from 'vue'
import { useLocalStorage } from '../composables/localStorage'
import { registerDataHandler, sendWsData } from '../utils/websocket'
import { type WebSocketMessage, WebSocketMessageType } from '../../shared/WebSocketMessage'

export const STORE_NAME = 'Preferences'

export const usePreferencesStore = defineStore(STORE_NAME, () => {
  const localStore = reactive(useLocalStorage())

  const proxySSL = computed<boolean>({
    get: () => localStore.prefs.proxySSL,
    set: (value) => (localStore.prefs.proxySSL = value),
  })

  const prefs = { proxySSL }
  const reactivePrefs = reactive(prefs)

  // send the prefs for changes and send'em over to the server
  watch(
    reactivePrefs,
    (newValue) =>
      sendWsData(WebSocketMessageType.Preferences, {
        ...newValue,
        // remove _getters (added by "reactive")
        _getters: undefined,
      }),
    { immediate: true }
  )

  // register the handlers (they will overwrite the previous ones)
  registerDataHandler(WebSocketMessageType.Preferences, ({ data }: WebSocketMessage<Record<string, any>>) => {
    Object.keys(data).forEach((key) => {
      if (key in prefs) (prefs[key as keyof typeof prefs] as Ref<unknown>).value = data[key]
    })
  })

  return prefs
})
