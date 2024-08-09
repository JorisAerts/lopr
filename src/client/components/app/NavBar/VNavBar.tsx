import { defineComponent } from 'vue'
import { VBadge, VBtn, VCard, VIcon, VSpacer, VTooltip } from '../../core'
import { APP_NAME } from '../../../../shared/constants'
import './VNavBar.scss'
import { useErrorLogStore } from '../../../stores/errorlog'

export const VNavBar = defineComponent({
  name: 'v-nav-bar',

  setup() {
    const errorLogStore = useErrorLogStore()

    return () => (
      <VCard class={['v-nav-bar', 'pa-2', 'd-flex', 'gap-2', 'align-items-center']}>
        <h4 class={['d-flex', 'align-center']}>
          <VIcon name={'DeployedCode_Fill'} size={22} class={['mr-1']} />
          {APP_NAME}
        </h4>
        <VSpacer />
        <VTooltip text={'Error log'}>
          <VBadge modelValue={errorLogStore.hasErrors} position={[4, -4]}>
            <VBtn icon={'Warning'} size={20} class={['pa-1']} transparent />
          </VBadge>
        </VTooltip>
      </VCard>
    )
  },
})
