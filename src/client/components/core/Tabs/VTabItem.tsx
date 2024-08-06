import { defineComponent } from 'vue'
import { VSheet } from '../Sheet'
import './VTabs.scss'

export const VTabItem = defineComponent({
  name: 'v-tab-item',

  setup(props, { slots }) {
    return () => <VSheet class={'v-tab-item'}></VSheet>
  },
})
