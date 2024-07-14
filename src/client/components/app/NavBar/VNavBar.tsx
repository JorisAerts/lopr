import { defineComponent } from 'vue'
import { VCard, VIcon } from '../../core'
import { APP_NAME } from '../../../../shared/constants'
import './VNavBar.scss'

export const VNavBar = defineComponent({
  name: 'v-nav-bar',

  setup(props, { slots }) {
    return () => (
      <VCard class={['v-nav-bar', 'pa-2', 'pl-3', 'd-flex', 'gap-2']}>
        <h4 class={['d-flex']}>
          <VIcon name={'DeployedCode_Fill'} size={22} class={['mr-1']} />
          {APP_NAME}
        </h4>
        {slots.default?.()}
      </VCard>
    )
  },
})
