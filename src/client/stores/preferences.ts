import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { computed, reactive, watch } from 'vue'
import { useLocalStorage } from '../composables/localStorage'
import { registerDataHandler, sendWsData } from '../utils/websocket'
import { type WebSocketMessage, WebSocketMessageType } from '../../shared/WebSocketMessage'

export const STORE_NAME = 'Preferences'

const bindLocalStorage = (key: keyof ReturnType<typeof useLocalStorage>['prefs']['value']) => {
  const localStore = useLocalStorage()
  return computed<boolean>({
    get: () => localStore.prefs.value[key],
    set: (value) => (localStore.prefs.value[key] = value),
  })
}

export const usePreferencesStore = defineStore(STORE_NAME, () => {
  const proxySSL = bindLocalStorage('proxySSL')
  //
  const prefs = { proxySSL }
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
