import './ResponseBody.scss'
import type { Ref } from 'vue'
import { computed, defineComponent, ref, Transition } from 'vue'
import type { ProxyResponseInfo } from 'lopr-shared'
import { VCheckbox, VSheet, VToolbar } from 'lopr-ui/components'
import type { UseResponse } from '../../composables/response'
import { useResponse } from '../../composables/response'
import { useRequest } from '../../composables/request'
import { useAppStore } from '../../stores/app'
import { parseHeaders } from '../../utils/request-utils'
import { makeUUIDProps } from '../../composables/uuid'

const RX_IS_IMAGE = /^image\//

const getContentFilename = (response: Ref<ProxyResponseInfo | undefined>) => {
  if (!response.value) return
  const contentDisposition = parseHeaders(response.value?.headers)?.['Content-Disposition'] as string
  if (contentDisposition) {
    const parts = contentDisposition.split(/\s*;\s*/)
    for (const part of parts) {
      if (part.startsWith('filename=')) {
        return part.substring(9, part.length).trim()
      }
    }
  }
}

const createBodyRenderer = (response: UseResponse) => {
  const classes = ['response-body', 'bordered', 'fill-height', 'pa-2']
  const appStore = useAppStore()

  if (response.isEmpty.value) return () => <VSheet class={classes}>No response data</VSheet>

  const type = response.contentType.value?.toLowerCase()
  const isJson = ref(false)
  const prettyJson = ref(false)
  const body = computed(() =>
    isJson.value && prettyJson.value //
      ? JSON.stringify(JSON.parse(response.body.value), null, 2)
      : response.body.value
  )

  switch (type) {
    case 'application/json':
    case 'application/javascript':
      isJson.value = true
    // eslint-disable-next-line no-fallthrough
    case 'text/xml':
    case 'text/html':
    case 'text/json':
    case 'application/x-javascript':
    case 'application/typescript':
    case 'application/x-typescript':
    case 'application/x-ns-proxy-autoconfig': // Automatic Proxy Configuration (PAC)
    case 'application/x-x509-ca-cert':
    case 'application/x-x509-user-cert':
    case 'text/javascript':
    case 'text/css':
    case 'text/plain':
      return () => (
        <VSheet class={[...classes, 'overflow-auto', 'd-flex', 'flex-column']}>
          <VToolbar class={['mt-1', 'mb-2', 'flex-grow-0']}>
            <VCheckbox label={'Wrap'} v-model={appStore.wrapResponseData} />
            <Transition>{isJson.value && <VCheckbox label={'Pretty'} v-model={prettyJson.value} />}</Transition>
          </VToolbar>
          <pre
            class={['text-mono', 'overflow-auto', 'flex-grow-1']}
            style={{
              'word-break': appStore.wrapResponseData ? ('break-word' as const) : undefined,
              whiteSpace: appStore.wrapResponseData ? 'pre-wrap' : 'pre',
            }}
          >
            {body.value}
          </pre>
        </VSheet>
      )
  }

  const request = useRequest({ modelValue: response.response.value?.uuid })
  const filename = computed(() => {
    const contentFilename = getContentFilename(response.response)
    if (contentFilename) {
      return contentFilename
    }

    const url = request.request.value?.url
    if (!url) return type
    const filename = url.substring(url.lastIndexOf('/') + 1, url.length)

    const paramPos = filename.indexOf('?')
    return paramPos === -1 ? filename : filename.substring(0, paramPos)
  })

  switch (type) {
    case 'image/svg':
    case 'image/svg+xml':
      return () => (
        <VSheet class={['response-body--checkered', 'overflow-auto', ...classes]}>
          {response.body.value && (
            <img
              src={`data:${type};base64, ${btoa(response.body.value)}`}
              alt={filename.value}
              style={{
                'max-width': '100%',
                'max-height': '100%',
              }}
            />
          )}
        </VSheet>
      )
  }

  if (RX_IS_IMAGE.test(type)) {
    return () =>
      response.hasBody.value && (
        <VSheet class={['response-body--checkered', 'overflow-auto', ...classes]}>
          <img
            src={`./api/data?uuid=${response.uuid.value}`}
            alt={filename.value}
            style={{
              'max-width': '100%',
              'max-height': '100%',
            }}
          />
        </VSheet>
      )
  }

  return () =>
    response.hasBody.value && (
      <VSheet class={[...classes, 'overflow-hidden']}>
        <a href={`./api/data?uuid=${response.uuid.value}`} download={filename.value} style={{ 'word-break': 'break-all' as const }}>
          Download: {filename.value}
        </a>
      </VSheet>
    )
}

export const ResponseBody = defineComponent({
  name: 'ResponseBody',

  props: {
    ...makeUUIDProps(),
  },

  setup(props) {
    const response = useResponse(props)
    const renderer = computed(() => createBodyRenderer(response))
    return () => renderer.value()
  },
})
