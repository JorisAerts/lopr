import './VLabel.scss'
import type { VNode } from 'vue'
import { defineComponent } from 'vue'

export const VLabel = defineComponent({
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

type LabelProps = { label: string | undefined }
export const wrapLabel = (props: LabelProps, contents: VNode[] | VNode) => (props.label ? <VLabel modelValue={props.label}>{contents}</VLabel> : contents)
