import { computed, defineComponent } from 'vue'
import { MonotypeView } from './MonotypeView'
import { VSheet } from 'lopr-ui'
import { makeFilenameProps, makeMimeTypeProps } from './mime-type'
import { useAppStore } from '../../stores/app'
import {
  APPLICATION_JAVASCRIPT,
  APPLICATION_JSON,
  APPLICATION_LD_PLUS_JSON,
  APPLICATION_RTF,
  APPLICATION_TYPESCRIPT,
  APPLICATION_X_JAVASCRIPT,
  APPLICATION_X_NS_PROXY_AUTOCONFIG,
  APPLICATION_X_TYPESCRIPT,
  APPLICATION_XML,
  IMAGE_SVG,
  IMAGE_SVG_PLUS_XML,
  TEXT_CSS,
  TEXT_HTML,
  TEXT_JAVASCRIPT,
  TEXT_JSON,
  TEXT_PLAIN,
  TEXT_XML,
} from 'lopr-shared/mime-types'

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
        case TEXT_HTML:
        case TEXT_XML:
        case APPLICATION_XML:
        case APPLICATION_LD_PLUS_JSON:
        case TEXT_JSON:
        case APPLICATION_JSON:
        case APPLICATION_JAVASCRIPT:
        case APPLICATION_X_JAVASCRIPT:
        case APPLICATION_TYPESCRIPT:
        case APPLICATION_X_TYPESCRIPT:
        case APPLICATION_X_NS_PROXY_AUTOCONFIG: // Automatic Proxy Configuration (PAC)
        case TEXT_JAVASCRIPT:
        case TEXT_CSS:
        case APPLICATION_RTF:
        case TEXT_PLAIN:
          return () => <MonotypeView {...props} v-model:wrap={appStore.wrapResponseData} />

        case IMAGE_SVG:
        case IMAGE_SVG_PLUS_XML:
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
