import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { sendWsData } from '../utils/websocket'
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

  return { recording, wrapResponseData }
})

export const isRecording = () => useAppStore().recording
