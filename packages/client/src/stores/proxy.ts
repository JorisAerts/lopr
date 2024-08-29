import { defineStore } from 'pinia'
import { shallowRef, watch } from 'vue'
import type { UrlMatch } from 'js-proxy-shared'
import { type ProxyState, WebSocketMessageType } from 'js-proxy-shared'
import { registerDataHandler, sendWsData } from '../utils/websocket'
import { useAppStore } from './app'

export const STORE_NAME = 'Proxy State'

export interface BreakPoint {
  req: boolean | undefined
  res: boolean | undefined
  match: UrlMatch
  disabled?: true | undefined
}

export const useProxyStore = defineStore(STORE_NAME, () => {
  const breakpoints = shallowRef([] as BreakPoint[])

  // when the breakpoints have been updated, send them to the WS!
  watch(breakpoints, () => sendWsData(WebSocketMessageType.State, { breakpoints: breakpoints.value }), { deep: true })

  // received state from the server
  registerDataHandler(WebSocketMessageType.State, ({ data }: { data: ProxyState }) => {
    if (data.recording != null) useAppStore().recording = data.recording
    if (data.breakpoints != null) breakpoints.value = data.breakpoints
  })

  return { breakpoints }
})
