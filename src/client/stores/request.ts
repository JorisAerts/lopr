import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import type { ProxyRequestInfo } from '../../shared/Request'
import { registerDataHandler } from '../utils/websocket'
import type { WebSocketMessage } from '../../shared/WebSocketMessage'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'
import type { ProxyResponseInfo } from '../../shared/Response'
import type { Unique } from '../../shared/UUID'

export const STORE_NAME = 'Requests'

export const useRequestStore = defineStore(STORE_NAME, () => {
  /**
   * The request data sent from the client.
   * All requests are tagged with a unique UUID
   */
  const requests = ref([] as ProxyRequestInfo[])
  /**
   * A map of response data to the client, mapped to the UUID of the request
   */
  const responces = shallowRef(new Map<string, ProxyResponseInfo>())
  // methods
  const getResponse = (request: Unique) => responces.value.get(request.uuid)
  const clear = () => {
    responces.value.clear()
    requests.value.length = 0
  }

  // register the handlers (they will overwrite the previous ones)
  registerDataHandler(WebSocketMessageType.ProxyRequest, ({ data }: WebSocketMessage<ProxyRequestInfo>) => {
    data.ts = new Date(data.ts)
    requests.value.push(data)
  })
  registerDataHandler(WebSocketMessageType.ProxyResponse, ({ data }: WebSocketMessage<ProxyResponseInfo>) => {
    data.ts = new Date(data.ts)
    responces.value.set(data.uuid, data)
  })
  return { requests, responses: responces, getResponse, clear }
})
