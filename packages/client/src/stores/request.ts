import { defineStore } from 'pinia'
import type { ProxyRequestInfo, UUID } from 'lopr-shared'
import type { Ref } from 'vue'
import { ref, triggerRef, watch } from 'vue'
import { useCache } from './cache'

export const STORE_NAME = 'Requests'

export interface StructNode {
  key: string
  isNew: boolean
  nodes?: { [Name: string]: StructNode }
  items?: UUID[]
}

export const useRequestStore = defineStore(STORE_NAME, () => {
  const cache = useCache()

  /**
   * The currently selected UUID (request/response)
   */
  const filter: Ref<string | undefined> = ref()

  /**
   * Structured tree-view of the requests
   */
  const structure = ref<StructNode>({ key: '', isNew: false })

  watch(
    () => cache.ids,
    () => cache.isEmpty && clearStructure(),
    { deep: true }
  )

  watch(filter, () => {
    clearStructure()
    cache.ids.forEach((uuid) => addRequest(uuid, false))
  })

  function clearStructure() {
    structure.value = { key: '', isNew: false }
    triggerRef(structure)
  }

  function isMatch(request: ProxyRequestInfo) {
    return !filter.value || request.url.indexOf(filter.value) > -1
  }

  function addRequest(uuid: UUID, isRecent = true) {
    const recent: string[] = []
    const request = cache.getRequest(uuid)
    if (!request?.url) return

    const url = request.urlNormal ?? request.url

    // don't add if there is a filter which doesn't match the request
    if (!isMatch(request)) return

    const indexOf = url.indexOf('://')
    const parts = (indexOf > -1 ? url.substring(indexOf + 3) : url) //
      .split('/')

    if (indexOf > -1) parts[0] = (indexOf > -1 ? url.substring(0, indexOf + 3) : '') + parts[0]
    if (parts.length === 1) parts.push('/')

    let current: StructNode = structure.value
    parts.reduce((key, p, i) => {
      current.key = key
      if (isRecent) recent.push(key)
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

    triggerRef(structure)
    cache.addRecent(...recent)
  }

  //

  return { structure, filter, addRequest }
})
