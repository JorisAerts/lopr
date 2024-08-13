import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import type { ProxyRequestInfo } from '../../shared/Request'
import { registerDataHandler } from '../utils/websocket'
import type { WebSocketMessage } from '../../shared/WebSocketMessage'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'
import type { ProxyResponseInfo } from '../../shared/Response'
import type { UUID } from '../../shared/UUID'
import { isRecording } from './app'

export const STORE_NAME = 'Requests'

const MAX_RECENT_ITEMS = 100

export const useRequestStore = defineStore(STORE_NAME, () => {
  /**
   * Contains all ids (chronologically sequential)
   */
  const ids = ref([] as UUID[])

  /**
   * Recently added UUIDS
   */
  const recent = ref([] as UUID[])

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
  const isNew = (uuid: UUID) => recent.value.includes(uuid)
  let timeOut: NodeJS.Timeout

  const registerUUID = (uuid: UUID) => {
    if (!ids.value.includes(uuid)) ids.value.push(uuid)

    recent.value.unshift(uuid)
    // LRU
    if (recent.value.length > MAX_RECENT_ITEMS) recent.value.length = MAX_RECENT_ITEMS
    clearTimeout(timeOut)
    timeOut = setTimeout(() => (recent.value.length = 0), 1000)
  }

  /**
   * Clear the store
   */
  const clear = () => {
    ids.value.length = 0
    recent.value.length = 0

    responses.value.clear()
    requests.value.clear()

    clearTimeout(timeOut)
  }

  // register the handlers (they will overwrite the previous ones)
  registerDataHandler(WebSocketMessageType.ProxyRequest, ({ data }: WebSocketMessage<ProxyRequestInfo>) => {
    if (!isRecording()) return
    data.ts = new Date(data.ts)
    requests.value.set(data.uuid, data)
    registerUUID(data.uuid)
  })

  registerDataHandler(WebSocketMessageType.ProxyResponse, ({ data }: WebSocketMessage<ProxyResponseInfo>) => {
    if (!isRecording()) return
    data.ts = new Date(data.ts)
    responses.value.set(data.uuid, data)
    registerUUID(data.uuid)
  })

  return { ids, requests, responses, getRequest, getResponse, isNew, clear }
})
