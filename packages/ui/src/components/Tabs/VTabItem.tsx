import './VTabItem.scss'
import { defineComponent, inject, readonly, ref } from 'vue'
import { VSheet } from '../Sheet'
import { makeTabItemsProps, TAB_SYMBOL } from './tabs'

export const VTabItem = defineComponent({
  name: 'v-tab-item',

  props: {
    ...makeTabItemsProps(),
  },

  setup(props, { slots }) {
    const defaultValue = readonly(ref<number | undefined>(undefined))
    const parentModelValue = inject(TAB_SYMBOL, defaultValue)
    return () => parentModelValue.value == props.modelValue && <VSheet class={'v-tab-item'}>{slots.default?.()}</VSheet>
  },
})
