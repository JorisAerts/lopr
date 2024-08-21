import { defineStore } from 'pinia'
import { computed, ref, shallowRef, triggerRef } from 'vue'
import type { ProxyRequestInfo } from '../../shared/Request'
import { registerDataHandler } from '../utils/websocket'
import type { WebSocketMessage } from '../../shared/WebSocketMessage'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'
import type { ProxyResponseInfo } from '../../shared/Response'
import type { UUID } from '../../shared/UUID'
import { isRecording } from './app'
import axios from 'axios'
import type { ProxyState } from '../../shared/ProxyState'

export const STORE_NAME = 'Requests'

const CLEAR_RECENT_TIMEOUT = 500

export interface StructNode {
  key: string
  isNew: boolean
  nodes?: { [Name: string]: StructNode }
  items?: UUID[]
}

export const useRequestStore = defineStore(STORE_NAME, () => {
  /**
   * Contains all ids (chronologically sequential)
   */
  const ids = ref([] as UUID[])

  /**
   * Recently added UUIDS
   */
  const recent = ref(new Set<UUID | string>([]))

  const struct = ref<StructNode>({ key: '', isNew: false })

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
  const isNew = (uuid: UUID | string) => recent.value.has(uuid)
  let timeOut: NodeJS.Timeout

  const pushRecentUUID = (uuid: UUID | string) => {
    recent.value.add(uuid)
    clearTimeout(timeOut)
    timeOut = setTimeout(() => recent.value.clear(), CLEAR_RECENT_TIMEOUT)
  }

  const addToStruct = (uuid: UUID, isRecent = true) => {
    const request = getRequest(uuid)
    if (!request?.url) return

    const url = request.urlNormal ?? request.url
    const indexOf = url.indexOf('://')
    const parts = (indexOf > -1 ? url.substring(indexOf + 3) : url) //
      .split('/')

    if (indexOf > -1) parts[0] = (indexOf > -1 ? url.substring(0, indexOf + 3) : '') + parts[0]
    if (parts.length === 1) parts.push('/')

    let current: StructNode = struct.value
    parts.reduce((key, p, i) => {
      current.key = key
      if (isRecent) pushRecentUUID(key)
      if (i === parts.length - 1) {
        current.items ??= []
        current.items.push(uuid)
      } else {
        current.nodes ??= {}
        current.nodes![p] ??= Object.create(null)
        current = current.nodes![p]
      }
      return `${key}${key ? '/' : ''}${p}`
    }, '')

    triggerRef(struct)
  }

  const registerUUID = (uuid: UUID, isRecent = true) => {
    if (ids.value.includes(uuid)) return
    ids.value.push(uuid)
    addToStruct(uuid, isRecent)
    if (isRecent) pushRecentUUID(uuid)
  }

  const empty = computed(() => ids.value.length === 0)

  const clearState = () => {
    ids.value.length = 0
    recent.value.clear()
    responses.value.clear()
    requests.value.clear()

    struct.value = { key: '', isNew: false }

    clearTimeout(timeOut)
  }

  /**
   * Clear the store (front- and backend)
   */
  const clear = () => axios.get('/api/state?clear').then(clearState)

  const refresh = () =>
    axios.get('/api/state').then((response) => {
      clearState()
      const data = response.data as ProxyState

      ;(Object.keys(data) as (keyof typeof data)[]).forEach((uuid) => {
        const item = data[uuid]
        if (item.request) requests.value.set(uuid, item.request)
        if (item.response) responses.value.set(uuid, item.response)
        registerUUID(uuid, false)
      })
    })

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

  refresh()

  return { ids, requests, responses, getRequest, getResponse, isNew, clear, refresh, structure: struct, recent, empty }
})
