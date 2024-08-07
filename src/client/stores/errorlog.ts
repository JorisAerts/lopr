import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ProxyRequestInfo } from '../../shared/Request'
import { registerDataHandler } from '../utils/websocket'
import type { WebSocketMessage } from '../../shared/WebSocketMessage'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'

export const STORE_NAME = 'Error Log'

export const useErrorLogStore = defineStore(STORE_NAME, () => {
  /**
   * A bunch of errors coming from the client
   */
  const errors = ref([] as unknown[])

  // register the handlers (they will overwrite the previous ones)
  registerDataHandler(WebSocketMessageType.Error, ({ data }: WebSocketMessage<ProxyRequestInfo>) => {
    data.ts = new Date(data.ts)
    errors.value.push(data)
  })
  return { errors }
})
