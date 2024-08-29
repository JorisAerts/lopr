import { defineStore } from 'pinia'
import { ref, shallowRef, watch } from 'vue'
import type { BreakPoint } from 'js-proxy-shared'
import { type ProxyState, WebSocketMessageType } from 'js-proxy-shared'
import { registerDataHandler, sendWsData } from '../utils/websocket'

export const STORE_NAME = 'Proxy State'

export const useProxyStore = defineStore(STORE_NAME, () => {
  const recording = ref(true)
  const breakpoints = shallowRef([] as BreakPoint[])

  // when the breakpoints have been updated, send them to the WS!
  watch(breakpoints, () => sendWsData(WebSocketMessageType.State, { breakpoints: breakpoints.value }), { deep: true })

  // send state to the server
  watch(recording, () => sendWsData(WebSocketMessageType.State, { recording: recording.value }))

  // received state from the server
  registerDataHandler(WebSocketMessageType.State, ({ data }: { data: ProxyState }) => {
    if (data.recording != null) recording.value = data.recording
    if (data.breakpoints != null) breakpoints.value = data.breakpoints
  })

  return { recording, breakpoints }
})
