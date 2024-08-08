import type { VNode } from 'vue'
import { defineComponent } from 'vue'
import { VSheet } from '../Sheet'
import './VTabItems.scss'
import { makeTabItemsProps } from './tabs'

export const VTabItems = defineComponent({
  name: 'v-tab-items',

  props: {
    ...makeTabItemsProps(),
  },

  setup(props, { slots }) {
    const currentWindow = (nodes: VNode[] | undefined) =>
      nodes //
        ?.find((node) => node.props?.modelValue === props.modelValue)

    return () => <VSheet class={'v-tab-items'}>{currentWindow(slots.default?.())}</VSheet>
  },
})
