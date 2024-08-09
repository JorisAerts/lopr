import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import { VCard, VSheet } from '../components'

export const Sequence = defineComponent({
  name: 'app-preferences',

  props: {
    width: {
      type: [Number, String] as PropType<number | string>,
      default: 320,
    },
  },

  setup(props) {
    return () => (
      <VSheet class={['fill-height', 'gap-2']}>
        <VCard class={['fill-height', 'overflow-auto', 'flex-grow-1', 'pa-3']}>
          <h2>Preferences</h2>
        </VCard>
      </VSheet>
    )
  },
})
