import { useRequestStore } from '../stores/request'
import { parseHeaders } from '../utils/request-utils'
import type { Ref } from 'vue'
import { computed, isRef, ref, triggerRef, watch } from 'vue'
import { HTTP_HEADER_CONTENT_ENCODING, HTTP_HEADER_CONTENT_TYPE } from 'lopr-shared/constants'
import type { UUIDModelProps } from './uuid'
import { useUUID } from './uuid'
import type { UUID } from 'lopr-shared'

/**
 * Utility methods for handling the response
 */
const useResponseByRef = (uuid: Ref<UUID | undefined>) => {
  const requestStore = useRequestStore()
  const response = computed(() => uuid.value && requestStore.getResponse(uuid.value))
  const headersRaw = computed(() => response.value?.headers)
  const headers = computed<Record<string, string>>(() => parseHeaders(headersRaw.value))
  const hasHeaders = computed(() => !!headersRaw.value)
  const bodyData = ref()
  watch(uuid, () => (bodyData.value = undefined))
  const hasBody = computed(() => !!(response.value?.contentLength || response.value?.body))
  const body = computed(() => {
    if (hasBody.value && !bodyData.value) {
      fetch(`/api/data?uuid=${uuid.value}`)
        .then((res) => res.text())
        .then((data) => (data ? (bodyData.value = data) : ''))
    }
    return bodyData.value
  })
  const contentType = computed(() => (headers.value?.[HTTP_HEADER_CONTENT_TYPE] ?? headers.value?.[HTTP_HEADER_CONTENT_TYPE.toLowerCase()])?.split(';')[0].trim())
  const contentEncoding = computed(() => headers.value?.[HTTP_HEADER_CONTENT_ENCODING])
  const contentLength = computed(() => {
    const contentLength = +headers.value?.['Content-Length']
    return isNaN(contentLength) ? undefined : contentLength
  })
  const isEmpty = computed(() => !hasBody.value || contentLength.value === 0)
  const isPaused = computed(() => !!response.value?.paused)

  watch(
    () => requestStore.responses,
    () => triggerRef(response),
    { deep: true }
  )

  return { uuid, response, hasBody, body, hasHeaders, headersRaw, headers, contentType, contentEncoding, contentLength, isEmpty, isPaused }
}

/**
 * Utility methods for handling the request
 */
export const useResponse = (uuid: UUIDModelProps | Ref<UUID | undefined>) => {
  return useResponseByRef(!isRef(uuid) ? useUUID(uuid) : uuid)
}

export type UseResponse = ReturnType<typeof useResponse>
