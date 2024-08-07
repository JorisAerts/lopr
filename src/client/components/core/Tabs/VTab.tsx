import { defineComponent } from 'vue'
import { VSheet } from '../Sheet'
import './VTabs.scss'

export const VTab = defineComponent({
  name: 'v-tab',

  props: {
    name: { type: String },
  },

  setup() {
    return () => <VSheet class={'v-tab'}></VSheet>
  },
})
