import { useRequestStore } from '../stores/request'
import { parseHeaders } from '../utils/request-utils'
import type { Ref } from 'vue'
import { computed, isRef } from 'vue'
import { HTTP_HEADER_CONTENT_ENCODING, HTTP_HEADER_CONTENT_LENGTH, HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_COOKIE } from '../../../shared/src/constants'
import type { UUIDModelProps } from './uuid'
import { useUUID } from './uuid'
import type { UUID } from '../../../shared/src/UUID'

/**
 * Utility methods for handling the request
 */
const useRequestByRef = (uuid: Ref<UUID | undefined>) => {
  const requestStore = useRequestStore()
  const request = computed(() => uuid.value && requestStore.getRequest(uuid.value))
  const headersRaw = computed(() => request.value?.headers)
  const headers = computed<Record<string, string>>(() => parseHeaders(headersRaw.value))
  const hasHeaders = computed<boolean>(() => !!headersRaw.value)
  const contentType = computed(() => headers.value?.[HTTP_HEADER_CONTENT_TYPE].split(';')[0].trim())
  const contentEncoding = computed(() => headers.value?.[HTTP_HEADER_CONTENT_ENCODING])
  const contentLength = computed(() => {
    const contentLength = +headers.value?.[HTTP_HEADER_CONTENT_LENGTH]
    return isNaN(contentLength) ? undefined : contentLength
  })
  const isEmpty = computed(() => contentLength.value === 0)
  const hasCookies = computed<boolean>(() => Object.keys(headers.value).includes(HTTP_HEADER_COOKIE))
  const cookiesRaw = computed(() => headers.value?.[HTTP_HEADER_COOKIE])
  const cookies = computed(
    () =>
      cookiesRaw.value?.split(';').reduce((a: Record<string, string>, b) => {
        const [key, value] = b.split('=')
        a[key.trim()] = decodeURI(value)
        return a
      }, {}) ?? ({} as Record<string, string>)
  )
  return { uuid, request, hasHeaders, headersRaw, headers, contentType, contentEncoding, contentLength, hasCookies, cookies, cookiesRaw, isEmpty }
}

/**
 * Utility methods for handling the request
 */
export const useRequest = (uuid: UUIDModelProps | Ref<UUID | undefined>) => {
  return useRequestByRef(!isRef(uuid) ? useUUID(uuid) : uuid)
}

export type UseRequest = ReturnType<typeof useRequest>
