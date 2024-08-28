import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { registerDataHandler } from '../utils/websocket'
import { WebSocketMessageType } from 'js-proxy-shared'

export const STORE_NAME = 'Certificates'

export const useCertificateStore = defineStore(STORE_NAME, () => {
  const certificates = ref(new Set<string>())

  // register the handlers (they will overwrite the previous ones)
  registerDataHandler(WebSocketMessageType.Certificate, ({ data }: { data: string[] }) => {
    data.forEach((certificate) => certificates.value.add(certificate))
  })

  return {
    certificates,
    isEmpty: computed(() => certificates.value.size === 0),
  }
})
