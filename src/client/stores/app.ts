import { defineStore } from 'pinia'
import { ref } from 'vue'

export const STORE_NAME = 'Application'

export const useAppStore = defineStore(STORE_NAME, () => {
  const recording = ref(true)

  return { recording }
})

export const isRecording = () => useAppStore().recording
