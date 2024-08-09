import './VTabSlider.scss'
import { defineComponent } from 'vue'

export const VTabSlider = defineComponent({
  name: 'v-tab-slider',

  props: {
    left: { type: Number, default: 0 },
    top: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
  },

  setup(props) {
    return () => (
      <div
        class={'v-tab-slider'}
        style={{
          top: `${props.top}px`,
          left: `${props.left}px`,
          width: `${props.width}px`,
        }}
      />
    )
  },
})
