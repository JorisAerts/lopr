import { defineComponent } from 'vue'
import { VCard } from '../Card'

export default defineComponent({
  name: 'v-menu-card',

  setup(props, { attrs, slots }) {
    return () => (
      <VCard class={['mt-1', 'py-1']} style={{ minWidth: '100px' }} {...attrs}>
        {slots.default?.()}
      </VCard>
    )
  },
})
