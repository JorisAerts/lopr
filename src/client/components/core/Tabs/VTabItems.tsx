import './VTabItems.scss'
import type { VNode } from 'vue';
import { defineComponent, Transition } from 'vue'
import { VSheet } from '../Sheet'
import { makeTabItemsProps } from './tabs'
import { VTabItem } from './VTabItem'

export const VTabItems = defineComponent({
  name: 'v-tab-items',

  props: {
    ...makeTabItemsProps(),
    transition: { type: Boolean, default: true },
  },

  setup(props, { slots }) {
    const renderContent = (nodes: VNode[] | undefined) =>
      nodes //
        ?.filter((node) => node.type !== VTabItem || node.props?.modelValue === props.modelValue)

    return () => {
      const defaultSlots = slots.default?.()
      const selectedSlot = renderContent(defaultSlots)
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
