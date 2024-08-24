import './VInputField.scss'
import { defineComponent, mergeProps } from 'vue'
import { makeInputFieldProps } from './fields'
import { VInputField } from './VInputField'

export const VEmailField = defineComponent({
  name: 'v-email-field',

  props: {
    ...makeInputFieldProps(),
  },

  setup(props, { slots, attrs }) {
    return () => (
      <VInputField {...mergeProps(attrs, props)} type="email">
        {{ ...slots }}
      </VInputField>
    )
  },
})
