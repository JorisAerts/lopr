import { defineComponent } from 'vue'
import { VCard, VSheet } from '../../ui'

export const Breakpoints = defineComponent({
  name: 'Breakpoints',

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
