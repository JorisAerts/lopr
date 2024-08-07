import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import type { ProxyRequestInfo } from '../../shared/Request'
import { registerDataHandler } from '../utils/websocket'
import type { WebSocketMessage } from '../../shared/WebSocketMessage'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'
import type { ProxyResponseInfo } from '../../shared/Response'

export const STORE_NAME = 'REQ'

export const useRequestStore = defineStore(STORE_NAME, () => {
  // define an endpoint to the websockets and intercept incoming requests
  const idMap = shallowRef(new Map<string, ProxyResponseInfo>())
  const requests = ref([] as ProxyRequestInfo[])

  registerDataHandler(
    WebSocketMessageType.ProxyRequest,
    ({ data }: WebSocketMessage<ProxyRequestInfo>) => {
      data.ts = new Date(data.ts)
      requests.value.push(data)
    }
  )
  registerDataHandler(
    WebSocketMessageType.ProxyResponse,
    ({ data }: WebSocketMessage<ProxyResponseInfo>) => {
      data.ts = new Date(data.ts)
      idMap.value.set(data.uuid, data)
    }
  )

  const getResponse = (request: ProxyResponseInfo) =>
    idMap.value.get(request.uuid)

  return { requests, map: idMap, getResponse }
})
