import './Label.scss'

import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import Label from './Label'

export default defineComponent(
  (props, { slots, attrs }) =>
    () =>
      props.modelValue ? (
        <Label modelValue={props.modelValue} {...attrs}>
          {slots.default?.()}
        </Label>
      ) : (
        slots.default?.()
      ),
  {
    name: 'v-label-wrapper',
    props: { modelValue: { type: String as PropType<string | undefined> } },
  }
)
