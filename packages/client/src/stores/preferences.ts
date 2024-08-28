import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { reactive, watch } from 'vue'
import { bindLocalStorage } from '../composables/localStorage'
import { registerDataHandler, sendWsData } from '../utils/websocket'
import { type WebSocketMessage, WebSocketMessageType } from 'js-proxy-shared'
import { useDarkMode } from '../composables/dark-mode'

export const STORE_NAME = 'Preferences'

export const usePreferencesStore = defineStore(STORE_NAME, () => {
  const proxySSL = bindLocalStorage('proxySSL')
  const { isDark } = useDarkMode()

  //
  const prefs = { proxySSL, isDark }
  const reactivePrefs = reactive(prefs)

  const send = (newValue = reactivePrefs) =>
    sendWsData(WebSocketMessageType.Preferences, {
      ...newValue,
      // remove _getters (added by "reactive")
      _getters: undefined,
    })

  // send the prefs for changes and send'em over to the server
  watch(reactivePrefs, send, { immediate: true })

  // register the handlers (they will overwrite the previous ones)
  registerDataHandler(WebSocketMessageType.Preferences, ({ data }: WebSocketMessage<Record<string, any>>) => {
    Object.keys(data).forEach((key) => {
      if (key in prefs) (prefs[key as keyof typeof prefs] as Ref<unknown>).value = data[key]
    })
  })

  return prefs
})
