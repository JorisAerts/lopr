import { defineComponent, Teleport } from 'vue'
import { APP_NAME } from '../../../../shared/constants'
import './VAppHeader.scss'

export const VAppHeader = defineComponent({
  name: 'v-app-header',

  setup() {
    return () => (
      <Teleport to={'head'}>
        <title>{APP_NAME}</title>
      </Teleport>
    )
  },
})
