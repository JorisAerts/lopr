import './VContainer.scss'
import { defineComponent } from 'vue'
import { VSheet } from '../Sheet'

export const VContainer = defineComponent({
  name: 'v-container',

  props: {
    center: { type: Boolean, default: false },
    vertical: { type: Boolean, default: false },
  },

  setup(props, { slots, attrs }) {
    return () => (
      <VSheet class={['v-container', { center: props.center, 'flex-column': props.vertical }]} {...attrs}>
        {slots.default?.()}
      </VSheet>
    )
  },
})
