import './VDialogCard.scss'
import { defineComponent } from 'vue'
import { VCard } from '../Card'

export const VDialogCard = defineComponent({
  name: 'v-dialog-card',

  setup(props, { slots, attrs }) {
    return () => (
      <VCard class={['v-dialog-card']} {...attrs}>
        {{ ...slots }}
      </VCard>
    )
  },
})
