import './VDialogCard.scss'

import { defineComponent } from 'vue'
import { VContainer } from '../Container'

export const VDialogCardButtons = defineComponent({
  name: 'v-dialog-card-buttons',

  setup(props, { slots }) {
    return () => <VContainer class={['v-dialog-card-buttons', 'd-flex', 'gap-2']}>{{ ...slots }}</VContainer>
  },
})
