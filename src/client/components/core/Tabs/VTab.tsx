import { defineComponent } from 'vue'
import './VTab.scss'
import { makeTabProps, useTabs } from './tabs'

export const VTab = defineComponent({
  name: 'v-tab',

  props: {
    ...makeTabProps(),
    name: { type: String },
    disabled: { type: Boolean, default: false },
  },

  setup(props) {
    const { on, classes } = useTabs(props)
    return () => (
      <button class={['v-tab', ...classes.value]} {...on} disabled={props.disabled}>
        {props.name}
      </button>
    )
  },
})
