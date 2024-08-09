import { defineComponent } from 'vue'
import { VCard, VSheet } from '../components'

export const Information = defineComponent({
  name: 'app-information',

  props: {},

  setup(props) {
    return () => (
      <VSheet class={['fill-height', 'gap-2']}>
        <VCard class={['fill-height', 'overflow-auto', 'flex-grow-1', 'pa-3']}>
          <h2>Information</h2>
        </VCard>
      </VSheet>
    )
  },
})
