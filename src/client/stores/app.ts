import { defineStore } from 'pinia'
import { ref } from 'vue'

export const STORE_NAME = 'Application'

export const useAppStore = defineStore(STORE_NAME, () => {
  const recording = ref(true)
  const wrapResponseData = ref(true)

  return { recording, wrapResponseData }
})

export const isRecording = () => useAppStore().recording
