import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { registerDataHandler, sendWsData } from '../utils/websocket'
import type { ProxyState } from 'js-proxy-shared'
import { WebSocketMessageType } from 'js-proxy-shared'

export const STORE_NAME = 'Application'

export const useAppStore = defineStore(STORE_NAME, () => {
  const recording = ref(true)
  const wrapResponseData = ref(false)

  // send state to the server
  watch([recording], () => {
    sendWsData(WebSocketMessageType.State, {
      recording: recording.value,
    })
  })

  // received state from the server
  registerDataHandler(WebSocketMessageType.State, ({ data }: { data: ProxyState }) => {
    if (data.recording !== undefined) recording.value = data.recording
  })

  return { recording, wrapResponseData }
})

export const isRecording = () => useAppStore().recording
