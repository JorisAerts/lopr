import { computed, defineComponent } from 'vue'
import { MonotypeView } from './MonotypeView'
import { useAppStore } from '../../../stores/app'
import { makeFilenameProps, makeMimeTypeProps } from './mime-type'
import { VSheet } from '../../ui'

export const MimeTypeDataView = defineComponent({
  name: 'MimeTypeDataView',

  props: {
    ...makeMimeTypeProps(),
    ...makeFilenameProps(),
  },

  setup(props, { slots }) {
    const appStore = useAppStore()
    const Renderer = computed(() => {
      if (!props.data || !props.mimeType) return undefined
      switch (props.mimeType?.toLowerCase()) {
        case 'text/html':
        case 'text/json':
        case 'application/json':
        case 'application/javascript':
        case 'application/x-javascript':
        case 'application/typescript':
        case 'application/x-typescript':
        case 'application/x-ns-proxy-autoconfig': // Automatic Proxy Configuration (PAC)
        case 'text/javascript':
        case 'text/css':
        case 'text/plain':
          return () => <MonotypeView {...props} v-model:wrap={appStore.wrapResponseData} />

        case 'image/svg':
        case 'image/svg+xml':
          return () => (
            <img
              src={`data:${props.mimeType};base64, ${btoa(props.data as string)}`}
              alt={props.filename}
              style={{
                'max-width': '100%',
                'max-height': '100%',
              }}
            />
          )
      }

      return () => <></>
    })

    return () => <VSheet class={['pa-2', 'overflow-auto']}>{props.data && Renderer.value && <Renderer.value />}</VSheet>
  },
})
