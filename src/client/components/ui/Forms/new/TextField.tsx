import './InputField.scss'

import { defineComponent, mergeProps } from 'vue'
import { makeInputFieldProps } from './fields'
import InputField from './InputField'

export default defineComponent({
  name: 'v-text-field',

  props: {
    ...makeInputFieldProps(),
  },

  setup(props, { slots, attrs }) {
    return () => (
      <InputField {...mergeProps(attrs, props)} type="text">
        {{ ...slots }}
      </InputField>
    )
  },
})
