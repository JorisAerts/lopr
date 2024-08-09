import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import type { ProxyRequestInfo } from '../../shared/Request'
import { registerDataHandler } from '../utils/websocket'
import type { WebSocketMessage } from '../../shared/WebSocketMessage'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'
import type { ProxyResponseInfo } from '../../shared/Response'
import type { UUID } from '../../shared/UUID'

export const STORE_NAME = 'Requests'

export const useRequestStore = defineStore(STORE_NAME, () => {
  /**
   * Contains all ids (chronologically sequential)
   */
  const ids = ref([] as UUID[])

  /**
   * The request data sent from the client.
   * All requests are tagged with a unique UUID
   */
  const requests = shallowRef(new Map<string, ProxyRequestInfo>())
  /**
   * A map of response data to the client, mapped to the UUID of the request
   */
  const responses = shallowRef(new Map<string, ProxyResponseInfo>())
  // methods
  const getResponse = (uuid: UUID) => responses.value.get(uuid)
  const getRequest = (uuid: UUID) => requests.value.get(uuid)

  const registerUUID = (uuid: UUID) => {
    if (!ids.value.includes(uuid)) ids.value.push(uuid)
  }

  /**
   * Clear the store
   */
  const clear = () => {
    ids.value.length = 0
    responses.value.clear()
    requests.value.clear()
  }

  // register the handlers (they will overwrite the previous ones)
  registerDataHandler(WebSocketMessageType.ProxyRequest, ({ data }: WebSocketMessage<ProxyRequestInfo>) => {
    data.ts = new Date(data.ts)
    requests.value.set(data.uuid, data)
    registerUUID(data.uuid)
  })
  registerDataHandler(WebSocketMessageType.ProxyResponse, ({ data }: WebSocketMessage<ProxyResponseInfo>) => {
    data.ts = new Date(data.ts)
    responses.value.set(data.uuid, data)
    registerUUID(data.uuid)
  })
  return { ids, requests, responses, getRequest, getResponse, clear }
})
