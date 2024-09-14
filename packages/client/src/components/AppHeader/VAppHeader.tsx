import { defineComponent, Teleport } from 'vue'
import { APP_NAME } from 'lopr-shared'
import { IMAGE_SVG_PLUS_XML } from 'lopr-shared/mime-types'
import { favicon } from '../../utils/favicon'

export const VAppHeader = defineComponent({
  name: 'v-app-header',

  setup() {
    return () => (
      <Teleport to={'head'}>
        <title>{APP_NAME}</title>
        <link rel="icon" href={`data:${IMAGE_SVG_PLUS_XML};base64,${favicon.value}`} />
      </Teleport>
    )
  },
})
