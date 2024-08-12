import { defineStore } from 'pinia'
import { ref } from 'vue'
import { registerDataHandler } from '../utils/websocket'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'

export const STORE_NAME = 'Certificates'

export const useCertificateStore = defineStore(STORE_NAME, () => {
  const certificates = ref([] as string[])

  // register the handlers (they will overwrite the previous ones)
  registerDataHandler(WebSocketMessageType.Certificate, ({ data }: { data: string }) => {
    certificates.value.push(data)
  })

  return { certificates }
})
