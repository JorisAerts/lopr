import './VLabel.scss'
import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import { VLabel } from './VLabel'

export const VLabelWrapper = defineComponent(
  (props, { slots, attrs }) =>
    () =>
      props.modelValue ? (
        <VLabel modelValue={props.modelValue} {...attrs}>
          {slots.default?.()}
        </VLabel>
      ) : (
        slots.default?.()
      ),
  {
    name: 'v-label-wrapper',
    props: { modelValue: { type: String as PropType<string | undefined> } },
  }
)
