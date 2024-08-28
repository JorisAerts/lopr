import { defineComponent, nextTick } from 'vue'
import { VBtn } from './VBtn'

export const VBtnGroup = defineComponent({
  name: 'v-btn-group',

  props: {
    modelValue: { type: Number, default: undefined },
  },

  setup(props, { slots }) {
    const renderSlots = () => {
      const defaultContent = slots.default?.()
      if (!defaultContent) return defaultContent

      const nodes = (Array.isArray(defaultContent) ? defaultContent : [defaultContent]) //
        .filter((node) => node.type === VBtn)

      // on the next tick, we'll have the buttons rendered out and being referenced
      nextTick().then(() =>
        nodes.forEach((node, index) => {
          const selected = node.component?.exposed?.selected
          if (selected) selected.value = index === props.modelValue
        })
      )

      return nodes
    }

    return () => <>{renderSlots()}</>
  },
})
