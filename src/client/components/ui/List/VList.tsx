import './VList.scss'
import { defineComponent } from 'vue'

export const VList = defineComponent({
  name: 'v-list',

  setup(props, { attrs, slots }) {
    return () => (
      <div class={'v-list'} {...attrs}>
        {slots.default?.()}
      </div>
    )
  },
})
