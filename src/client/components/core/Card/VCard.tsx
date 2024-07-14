import './VCard.scss'
import { defineComponent } from 'vue'
import { VSheet } from '../Sheet'

export const VCard = defineComponent({
  name: 'v-card',

  props: {
    center: { type: Boolean, default: false },
    vertical: { type: Boolean, default: false },
  },

  inheritAttrs: false,

  setup(props, { slots, attrs }) {
    return () => (
      <VSheet
        {...attrs}
        class={['v-card', { 'v-card--clickable': attrs.onClick }]}
      >
        {slots.default?.()}
      </VSheet>
    )
  },
})
