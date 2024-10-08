import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { computed, ref, shallowRef, triggerRef } from 'vue'
import type { ProxyRequestHistory, ProxyRequestInfo, WebSocketMessage } from 'lopr-shared'
import { WebSocketMessageType } from 'lopr-shared'
import { registerDataHandler, sendWsData } from '../utils/websocket'
import type { ProxyResponseInfo } from 'lopr-shared/Response'
import type { UUID } from 'lopr-shared/UUID'
import { useProxyStore } from './proxy'
import { useAppStore } from './app'
import { useRequestStore } from './request'

export const STORE_NAME = 'Cache'

const CLEAR_RECENT_TIMEOUT = 500

export interface StructNode {
  key: string
  isNew: boolean
  nodes?: { [Name: string]: StructNode }
  items?: UUID[]
}

export const useCache = defineStore(STORE_NAME, () => {
  const initialized = ref(false)
  const proxyState = useProxyStore()

  /**
   * The currently selected UUID (request/response)
   */
  const current: Ref<UUID | undefined> = ref()

  /**
   * Contains all ids (chronologically sequential)
   */
  const ids = ref([] as UUID[])

  /**
   * Recently added UUIDS
   */
  const recent = ref(new Set<UUID | string>([]))

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
  let timeOut: number // .Timeout

  const addRecent = (...ids: (UUID | string)[]) => {
    ids.forEach((id) => recent.value.add(id))
    clearTimeout(timeOut)
    timeOut = window.setTimeout(() => recent.value.clear(), CLEAR_RECENT_TIMEOUT)
  }

  const requestStore = useRequestStore()

  const registerUUID = (uuid: UUID, isRecent = true) => {
    if (ids.value.includes(uuid)) return
    ids.value.push(uuid)
    requestStore.addRequest(uuid, isRecent)
    if (isRecent) addRecent(uuid)
  }

  const isEmpty = computed(() => ids.value.length === 0)

  const clearState = () => {
    current.value = undefined

    ids.value.length = 0
    recent.value.clear()
    responses.value.clear()
    requests.value.clear()

    triggerRef(ids)

    window.clearTimeout(timeOut)
  }

  /**
   * Clear the store (front- and backend)
   */
  const clear = (port?: string) => {
    if (port && port !== `${useAppStore().port}`) fetch(`/api/state?clear&port=${port}`)
    else
      fetch(`/api/state?clear`) //
        .then(clearState)
        .then(useAppStore().clear)
  }

  const isValidUUID = (uuid?: string) => uuid && ids.value.includes(uuid as UUID)

  /**
   * If no state is provided, it's requested from the server
   */
  const refresh = (data?: ProxyRequestHistory): Promise<ProxyRequestHistory> => {
    if (!data)
      return fetch('/api/state')
        .then((res) => res.json() as unknown as ProxyRequestHistory)
        .then((proxyState) => refresh(proxyState))

    const oldCurrent = current.value
    clearState()
    current.value = oldCurrent
    ;(Object.keys(data) as (keyof typeof data)[]).forEach((uuid) => {
      const item = data[uuid]
      if (item.request) requests.value.set(uuid, item.request)
      if (item.response) responses.value.set(uuid, item.response)
      registerUUID(uuid, false)
    })

    return Promise.resolve(data)
  }

  // register the handlers (they will overwrite the previous ones)
  registerDataHandler(WebSocketMessageType.ProxyRequest, ({ data }: WebSocketMessage<ProxyRequestInfo>) => {
    if (!proxyState.recording) return
    data.ts = new Date(data.ts)
    if (requests.value.has(data.uuid)) {
      requests.value.set(data.uuid, Object.assign(requests.value.get(data.uuid)!, data))
    } else {
      requests.value.set(data.uuid, data)
    }
    triggerRef(requests)
    registerUUID(data.uuid)

    if (!useAppStore().fetching) useAppStore().clear()
  })

  registerDataHandler(WebSocketMessageType.ProxyResponse, ({ data }: WebSocketMessage<ProxyResponseInfo>) => {
    if (!proxyState.recording) return
    data.ts = new Date(data.ts)
    if (responses.value.has(data.uuid)) {
      responses.value.set(data.uuid, Object.assign(responses.value.get(data.uuid)!, data))
    } else {
      responses.value.set(data.uuid, data)
    }
    triggerRef(responses)
    registerUUID(data.uuid)
    if (!useAppStore().fetching) useAppStore().clear()
  })

  // initially fetch the state from the server
  refresh().finally(() => {
    initialized.value = true
    triggerRef(current)
  })

  return {
    initialized,

    current,

    ids,
    requests,
    responses,
    getRequest,
    getResponse,
    isNew,
    recent,
    isEmpty,
    isValidUUID,

    addRecent,

    clear,
    refresh,
  }
})

export const resumeRequest = (uuid: UUID) => {
  const request = useCache().getRequest(uuid)
  if (!request) return
  sendWsData(WebSocketMessageType.ProxyRequest, { ...request, paused: false })
}

export const resumeResponse = (uuid: UUID) => {
  const response = useCache().getResponse(uuid)
  if (!response) return
  sendWsData(WebSocketMessageType.ProxyResponse, { ...response, paused: false })
}
