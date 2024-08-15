import './VCheckbox.scss'
import { defineComponent } from 'vue'

export const VCheckbox = defineComponent({
  name: 'v-checkbox',

  props: {
    modelValue: { type: Boolean, default: false },
    label: { type: String },
    disabled: { type: Boolean, default: false },
  },

  setup(props, { slots }) {
    return () => (
      <label class={['v-checkbox']}>
        <input class={['v-checkbox--input']} type="checkbox" checked={props.modelValue} disabled={props.disabled} />
        <span class={['v-checkbox--label']}>{slots.label?.() ?? props.label}</span>
      </label>
    )
  },
})
