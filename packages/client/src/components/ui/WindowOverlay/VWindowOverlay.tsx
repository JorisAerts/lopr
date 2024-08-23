import './VWindowOverlay.scss'
import { defineComponent } from 'vue'

export const VWindowOverlay = defineComponent({
  name: 'v-window-overlay',

  emits: ['contextmenu'],

  props: {
    transparent: { type: Boolean, default: true },
    centered: { type: Boolean, default: true },
    blurred: { type: Boolean, default: true },
  },

  setup(props, { slots, attrs, emit }) {
    return () => (
      <div
        class={{
          'v-window-overlay': true,
          'v-window-overlay--transparent': props.transparent,
          'v-window-overlay--centered': props.centered,
          'v-window-overlay--blurred': props.blurred,
        }}
        {...attrs}
        onContextmenu={(e: MouseEvent) => emit('contextmenu', e)}
      >
        {slots.default?.()}
      </div>
    )
  },
})
