import type { Ref } from 'vue'
import { computed, defineComponent } from 'vue'
import type { UseResponse } from '../../../composables/response'
import { useResponse } from '../../../composables/response'
import { VSheet } from '../../ui'
import { VDownloadData } from '../DownloadData'
import { useRequest } from '../../../composables/request'
import { useAppStore } from '../../../stores/app'
import { parseHeaders } from '../../../utils/request-utils'
import type { ProxyResponseInfo } from '../../../../shared/Response'
import { makeUUIDProps } from '../../../composables/uuid'

const RX_IS_IMAGE = /^image\//

const getImageData = (response: UseResponse) => {
  try {
    const arr = Uint8Array.from(response.body.value, (c) => c.charCodeAt(0))
    const blob = new Blob([arr], { type: response.contentType.value })
    return URL.createObjectURL(blob)
  } catch (e) {
    console.error({ e })
    return undefined
  }
}

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
  const classes = ['bordered', 'fill-height', 'pa-2', 'overflow-auto']
  const appStore = useAppStore()

  if (response.isEmpty.value) return () => <VSheet class={classes}>No response data</VSheet>

  const type = response.contentType.value?.toLowerCase()
  switch (type) {
    case 'text/html':
    case 'text/json':
    case 'application/json':
    case 'application/javascript':
    case 'application/typescript':
    case 'text/javascript':
    case 'text/css':
    case 'text/plain':
      return () => (
        <div class={classes}>
          <div class={['mt-1', 'mb-2']}>
            <label class={['d-flex', 'align-items-center']}>
              <input type={'checkbox'} checked={appStore.wrapResponseData} onChange={(e) => (appStore.wrapResponseData = (e.target as HTMLInputElement).checked)} /> Wrap
            </label>
          </div>
          <pre
            class={['text-mono']}
            style={{
              whiteSpace: appStore.wrapResponseData ? 'pre-wrap' : 'pre',
            }}
          >
            {response.body.value}
          </pre>
        </div>
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

  if (RX_IS_IMAGE.test(type)) {
    return () =>
      response.body.value && (
        <VSheet class={classes}>
          <img
            src={getImageData(response)}
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
    response.body.value && (
      <VSheet class={classes}>
        <VDownloadData type={type} data={response.body.value} filename={filename.value}>
          Download: {filename.value}
        </VDownloadData>
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
