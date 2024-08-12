import type { PropType } from 'vue'
import { computed, defineComponent, ref } from 'vue'
import type { UUID } from '../../../../shared/UUID'
import type { UseResponse } from '../../../composables/response'
import { useResponse } from '../../../composables/response'
import { VSheet } from '../../core'
import { VDownloadData } from '../DownloadData'
import { useRequest } from '../../../composables/request'

const RX_IS_IMAGE = /^image\//

const getImageData = (response: UseResponse) => {
  try {
    return `data:${response.contentType};base64,${btoa(response.body.value)}`
  } catch {
    return undefined
  }
}

const createBodyRenderer = (response: UseResponse) => {
  const classes = ['bordered', 'fill-height', 'pa-2', 'overflow-auto']
  const wrap = ref(true)

  if (response.isEmpty.value) return () => <VSheet class={classes}>No response data</VSheet>

  const type = response.contentType.value?.toLowerCase()
  switch (type) {
    case 'text/html':
    case 'text/json':
    case 'application/json':
    case 'application/javascript':
    case 'text/css':
    case 'text/plain':
      return () => (
        <div class={classes}>
          <div class={['mt-1', 'mb-2']}>
            <label class={['d-flex', 'align-items-center']}>
              <input type={'checkbox'} checked={wrap.value} onChange={(e) => (wrap.value = (e.target as HTMLInputElement).checked)} /> Wrap
            </label>
          </div>
          <pre
            class={['text-mono']}
            style={{
              whiteSpace: wrap.value ? 'wrap' : 'nowrap',
            }}
          >
            {response.body.value}
          </pre>
        </div>
      )
  }

  if (RX_IS_IMAGE.test(type)) {
    return () =>
      response.body.value && (
        <VSheet class={classes}>
          <img src={getImageData(response)} alt="Content" />
        </VSheet>
      )
  }

  const request = useRequest({ modelValue: response.response.value?.uuid })
  const filename = computed(() => {
    const url = request.request.value?.url
    if (!url) return type
    return url.substring(url.lastIndexOf('/') + 1, url.length)
  })
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
    modelValue: { type: String as PropType<UUID> },
  },

  setup(props) {
    const response = useResponse(props)
    const renderer = computed(() => createBodyRenderer(response))
    return () => renderer.value()
  },
})
