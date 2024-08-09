import { defineComponent } from 'vue'
import { VCard, VSheet } from '../components'

export const Sequence = defineComponent({
  name: 'error-log',

  setup() {
    return () => (
      <VSheet class={['fill-height', 'gap-2']}>
        <VCard class={['fill-height', 'overflow-auto', 'flex-grow-1', 'pa-3']}>
          <h2>Error log</h2>
        </VCard>
      </VSheet>
    )
  },
})
