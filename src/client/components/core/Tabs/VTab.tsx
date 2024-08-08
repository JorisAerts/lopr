import { defineComponent } from 'vue'
import './VTab.scss'

export const VTab = defineComponent({
  name: 'v-tab',

  props: {
    name: { type: String },
    active: { type: Boolean },
  },

  setup(props) {
    return () => <button class={['v-tab']}>{props.name}</button>
  },
})
