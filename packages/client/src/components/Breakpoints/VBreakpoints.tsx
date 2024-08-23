import { defineComponent } from 'vue'
import { VCard, VSheet } from 'js-proxy-ui/components'

export const VBreakpoints = defineComponent({
  name: 'VBreakpoints',

  setup(props, { slots }) {
    return () => (
      <VSheet>
        <VCard class={['pa-2']}>
          <ul>
            <li>not yet...</li>
          </ul>
        </VCard>
      </VSheet>
    )
  },
})
