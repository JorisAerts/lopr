import { defineComponent } from 'vue'
import { VBtn, VCard, VIcon, VSpacer, VTooltip } from '../../core'
import { APP_NAME } from '../../../../shared/constants'
import './VNavBar.scss'

export const VNavBar = defineComponent({
  name: 'v-nav-bar',

  setup() {
    return () => (
      <VCard class={['v-nav-bar', 'pa-2', 'd-flex', 'gap-2', 'align-items-center']}>
        <h4 class={['d-flex', 'align-center']}>
          <VIcon name={'DeployedCode_Fill'} size={22} class={['mr-1']} />
          {APP_NAME}
        </h4>
        <VSpacer />
        <VTooltip text={'Error log'}>
          <VBtn icon={'Monitoring'} size={20} class={['pa-1']} transparent />
        </VTooltip>
      </VCard>
    )
  },
})
