import './ResponseBody.scss'
import type { Ref } from 'vue'
import { computed, defineComponent, ref, Transition } from 'vue'
import type { ProxyResponseInfo } from 'lopr-shared'
import {
  APPLICATION_JAVASCRIPT,
  APPLICATION_JSON,
  APPLICATION_TYPESCRIPT,
  APPLICATION_X_JAVASCRIPT,
  APPLICATION_X_NS_PROXY_AUTOCONFIG,
  APPLICATION_X_TYPESCRIPT,
  APPLICATION_X_X509_CA_CERT,
  APPLICATION_X_X509_USER_CERT,
  APPLICATION_XHTML_PLUS_XML,
  APPLICATION_XML,
  IMAGE_SVG,
  IMAGE_SVG_PLUS_XML,
  TEXT_CSS,
  TEXT_CSV,
  TEXT_HTML,
  TEXT_JAVASCRIPT,
  TEXT_JSON,
  TEXT_PLAIN,
  TEXT_XML,
} from 'lopr-shared/mime-types'
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
    case APPLICATION_JSON:
    case TEXT_JSON:
      isJson.value = true
    // eslint-disable-next-line no-fallthrough
    case TEXT_CSV:
    case TEXT_XML:
    case TEXT_HTML:
    case APPLICATION_JAVASCRIPT:
    case APPLICATION_X_JAVASCRIPT:
    case APPLICATION_TYPESCRIPT:
    case APPLICATION_X_TYPESCRIPT:
    case APPLICATION_X_NS_PROXY_AUTOCONFIG: // Automatic Proxy Configuration (PAC)
    case APPLICATION_X_X509_CA_CERT:
    case APPLICATION_X_X509_USER_CERT:
    case APPLICATION_XHTML_PLUS_XML:
    case APPLICATION_XML:
    case TEXT_JAVASCRIPT:
    case TEXT_CSS:
    case TEXT_PLAIN:
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
    case IMAGE_SVG:
    case IMAGE_SVG_PLUS_XML:
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
