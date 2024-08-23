import './VInputField.scss'
import { defineComponent, mergeProps } from 'vue'
import { makeInputFieldProps } from './fields'
import { VInputField } from './VInputField'

export const VNumberField = defineComponent({
  name: 'v-number-field',

  props: {
    ...makeInputFieldProps(),
  },

  setup(props, { slots, attrs }) {
    return () => (
      <VInputField {...mergeProps(attrs, props)} type="number">
        {{ ...slots }}
      </VInputField>
    )
  },
})
