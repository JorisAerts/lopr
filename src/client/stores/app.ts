import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { registerDataHandler, sendWsData } from '../utils/websocket'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'
import type { ProxyState } from '../../shared/ProxyState'

export const STORE_NAME = 'Application'

export const useAppStore = defineStore(STORE_NAME, () => {
  const recording = ref(true)
  const wrapResponseData = ref(true)

  // send state to the server
  watch([recording], () => {
    sendWsData(WebSocketMessageType.State, {
      recording: recording.value,
    })
  })

  // received state from the server
  registerDataHandler(WebSocketMessageType.State, ({ data }: { data: ProxyState }) => {
    if (data.recording) recording.value = data.recording
  })

  return { recording, wrapResponseData }
})

export const isRecording = () => useAppStore().recording
