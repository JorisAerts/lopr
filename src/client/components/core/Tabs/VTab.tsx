import { defineComponent } from 'vue'
import { VSheet } from '../Sheet'
import './VTabs.scss'

const tabIndex = 0

export const VTab = defineComponent({
  name: 'v-tab',

  props: {
    name: { type: String },
  },

  setup(props, { slots, attrs }) {
    return () => parent && <VSheet class={'v-tab'}></VSheet>
  },
})
