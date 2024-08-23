import './VInputField.scss'
import { defineComponent, mergeProps } from 'vue'
import { makeInputFieldProps } from './fields'
import { VInputField } from './VInputField'

export const VPasswordField = defineComponent({
  name: 'v-password-field',

  props: {
    ...makeInputFieldProps(),
  },

  setup(props, { slots, attrs }) {
    return () => (
      <VInputField {...mergeProps(attrs, props)} type="password">
        {{ ...slots }}
      </VInputField>
    )
  },
})
