import './VCheckbox.scss'
import { defineComponent } from 'vue'

export const VCheckbox = defineComponent({
  name: 'v-checkbox',

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'update:modelValue': (v: boolean) => true,
  },

  props: {
    modelValue: { type: Boolean, default: false },
    label: { type: String },
    disabled: { type: Boolean, default: false },
  },

  setup(props, { slots, emit }) {
    return () => (
      <label class={['v-checkbox']}>
        <input
          class={['v-checkbox--input']}
          type="checkbox"
          checked={props.modelValue}
          disabled={props.disabled}
          onChange={(e) => emit('update:modelValue', (e.target as HTMLInputElement)?.checked)}
        />
        <span class={['v-checkbox--label']}>{slots.label?.() ?? props.label}</span>
      </label>
    )
  },
})
