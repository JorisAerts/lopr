import type { UUID } from '../../shared/UUID'
import { useRequestStore } from '../stores/request'
import { parseHeaders } from '../utils/request-utils'
import { computed } from 'vue'

export interface ResponseProps {
  modelValue: UUID | undefined
}

/**
 * Utility methods for handling the request
 */
export const useRequest = (props: ResponseProps) => {
  const requestStore = useRequestStore()
  const request = computed(() => props.modelValue && requestStore.getRequest(props.modelValue))
  const headers = computed<Record<string, string>>(() => parseHeaders(request.value?.headers))
  const hasHeaders = computed(() => !!headers.value)
  const contentType = computed(() => headers.value?.['Content-Type'].split(';')[0].trim())
  const contentEncoding = computed(() => headers.value?.['Content-Encoding'])
  const contentLength = computed(() => {
    const contentLength = +headers.value?.['Content-Length']
    return isNaN(contentLength) ? undefined : contentLength
  })
  const isEmpty = computed(() => contentLength.value === 0)
  return { request, hasHeaders, headers, contentType, contentEncoding, contentLength, isEmpty }
}

export type UseRequest = ReturnType<typeof useRequest>
