import './VCard.scss'
import { defineComponent } from 'vue'
import { VSheet } from '../Sheet'

export const VCard = defineComponent({
  name: 'v-card',

  props: {
    flat: { type: Boolean, default: false },
  },

  setup(props, { slots, attrs }) {
    return () => (
      <VSheet
        {...attrs}
        class={[
          'v-card',
          {
            'v-card__clickable': attrs.onClick,
            'v-card__flat': props.flat,
          },
        ]}
      >
        {slots.default?.()}
      </VSheet>
    )
  },
})
