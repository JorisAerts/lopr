import './VDivider.scss'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'v-divider',

  props: {
    vertical: { type: Boolean, default: false },
  },

  setup(props, { attrs, slots }) {
    return () => (
      <div
        class={[
          'v-divider',
          {
            vertical: props.vertical,
          },
        ]}
        {...attrs}
      >
        {slots.default?.()}
      </div>
    )
  },
})
