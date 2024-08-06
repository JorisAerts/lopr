import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ProxyRequestInfo } from '../../shared/Request'
import { registerDataHandler } from '../utils/websocket'
import type { WebSocketMessage } from '../../shared/WebSocketMessage'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'

export const STORE_NAME = 'REQ'

export const useRequestStore = defineStore(STORE_NAME, () => {
  // define an endpoint to the websockets and intercept incoming requests
  const requests = ref([] as ProxyRequestInfo[])

  registerDataHandler(
    WebSocketMessageType.ProxyRequest,
    ({ data }: WebSocketMessage<ProxyRequestInfo>) => {
      data.ts = new Date(data.ts)
      requests.value.push(data)
    }
  )

  return { requests }
})
