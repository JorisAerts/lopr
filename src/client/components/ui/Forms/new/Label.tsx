import './Label.scss'

import type { VNode } from 'vue'
import { defineComponent } from 'vue'

const Label = defineComponent({
  name: 'v-label',

  props: {
    modelValue: { type: String },
  },

  setup(props, { slots, attrs }) {
    return () => (
      <label class={['v-label']} {...attrs}>
        <span>{props.modelValue ? `${props.modelValue}:` : null}</span>
        {slots.default?.()}
      </label>
    )
  },
})

export default Label

type LabelProps = { label: string | undefined }
export const wrapLabel = (props: LabelProps, contents: VNode[] | VNode) => (props.label ? <Label modelValue={props.label}>{contents}</Label> : contents)
