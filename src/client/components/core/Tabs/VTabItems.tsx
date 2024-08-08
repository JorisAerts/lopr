import type { VNode } from 'vue'
import { defineComponent, Transition } from 'vue'
import { VSheet } from '../Sheet'
import './VTabItems.scss'
import { makeTabItemsProps } from './tabs'

export const VTabItems = defineComponent({
  name: 'v-tab-items',

  props: {
    ...makeTabItemsProps(),
    transition: { type: Boolean, default: true },
  },

  setup(props, { slots }) {
    const currentWindow = (nodes: VNode[] | undefined) =>
      nodes //
        ?.find((node) => node.props?.modelValue === props.modelValue)

    return () => {
      const defaultSlots = slots.default?.()
      const selectedSlot = currentWindow(defaultSlots)
      return (
        <VSheet class={'v-tab-items'}>
          {props.transition ? ( //
            <Transition duration={0.25}>{selectedSlot}</Transition>
          ) : (
            selectedSlot
          )}
        </VSheet>
      )
    }
  },
})
