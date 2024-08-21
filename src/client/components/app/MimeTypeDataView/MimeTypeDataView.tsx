import type { PropType } from 'vue'
import { computed, defineComponent } from 'vue'
import { MonotypeView } from './MonotypeView'
import { useAppStore } from '../../../stores/app'

export const MimeTypeDataView = defineComponent({
  name: 'MimeTypeDataView',

  props: {
    data: { type: [String, Object, Buffer] as PropType<any | undefined> },
    mimeType: { type: String },
  },

  setup(props, { slots }) {
    const appStore = useAppStore()
    const Renderer = computed(() => {
      switch (props.mimeType) {
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
          return () => <MonotypeView data={props.data} v-model:wrap={appStore.wrapResponseData} />
      }
    })

    return () => Renderer.value && <Renderer.value />
  },
})
