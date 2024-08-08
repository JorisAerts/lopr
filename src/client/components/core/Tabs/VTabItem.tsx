import { defineComponent } from 'vue'
import { VSheet } from '../Sheet'
import './VTabs.scss'
import { makeTabItemsProps } from './tabs'

export const VTabItem = defineComponent({
  name: 'v-tab-item',

  props: {
    ...makeTabItemsProps(),
  },

  setup(props, { slots }) {
    return () => <VSheet class={'v-tab-item'}>{slots.default?.()}</VSheet>
  },
})
