import type { UUID } from '../../shared/UUID'
import { useRequestStore } from '../stores/request'
import { parseHeaders } from '../utils/request-utils'
import { computed } from 'vue'

export interface ResponseProps {
  modelValue: UUID | undefined
}

/**
 * Utility methods for handling the response
 */
export const useResponse = (props: ResponseProps) => {
  const requestStore = useRequestStore()
  const response = computed(() => props.modelValue && requestStore.getResponse(props.modelValue))
  const headers = computed<Record<string, string>>(() => parseHeaders(response.value?.headers))
  const hasHeaders = computed(() => !!headers.value)
  const body = computed(() => response.value?.body as string)
  const hasBody = computed(() => !!body.value)
  const contentType = computed(() => headers.value?.['Content-Type'].split(';')[0].trim())
  const contentEncoding = computed(() => headers.value?.['Content-Encoding'])
  const contentLength = computed(() => {
    const contentLength = +headers.value?.['Content-Length']
    return isNaN(contentLength) ? undefined : contentLength
  })
  const isEmpty = computed(() => !hasBody.value || contentLength.value === 0)
  return { response, hasBody, body, hasHeaders, headers, contentType, contentEncoding, contentLength, isEmpty }
}

export type UseResponse = ReturnType<typeof useResponse>
