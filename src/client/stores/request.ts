import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import type { ProxyRequestInfo, ProxyResponseInfo } from '../../shared/Request'
import { registerDataHandler } from '../utils/websocket'
import type { WebSocketMessage } from '../../shared/WebSocketMessage'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'

export const STORE_NAME = 'REQ'

export const useRequestStore = defineStore(STORE_NAME, () => {
  // define an endpoint to the websockets and intercept incoming requests
  const idMap = shallowRef(
    new Map<string, (ProxyRequestInfo | ProxyResponseInfo)[]>()
  )
  const requests = ref([] as ProxyRequestInfo[])

  const addMapData = <Data extends ProxyRequestInfo | ProxyResponseInfo>(
    data: Data
  ) => {
    if (!data.uuid) return data
    if (!idMap.value.has(data.uuid)) {
      idMap.value.set(data.uuid, [])
    }
    idMap.value.get(data.uuid)!.push(data)
    return data
  }

  registerDataHandler(
    WebSocketMessageType.ProxyRequest,
    ({ data }: WebSocketMessage<ProxyRequestInfo>) => {
      data.ts = new Date(data.ts)
      requests.value.push(data)

      addMapData(data)
    }
  )
  registerDataHandler(
    WebSocketMessageType.ProxyResponse,
    ({ data }: WebSocketMessage<ProxyResponseInfo>) => {
      data.ts = new Date(data.ts)

      addMapData(data)
    }
  )

  return { requests, map: idMap }
})
