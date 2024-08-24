import './VInputField.scss'
import { defineComponent, mergeProps } from 'vue'
import { makeInputFieldProps } from './fields'
import { VInputField } from './VInputField'

export const VTextField = defineComponent({
  name: 'v-text-field',

  props: {
    ...makeInputFieldProps(),
  },

  setup(props, { slots, attrs }) {
    return () => (
      <VInputField {...mergeProps(attrs, props)} type="text">
        {{ ...slots }}
      </VInputField>
    )
  },
})
