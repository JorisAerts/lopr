import type { PropType } from 'vue';
import { defineComponent } from 'vue'
import { VSheet } from '../Sheet'
import './VTabs.scss'

export const VTabItems = defineComponent({
  name: 'v-tab-items',

  props: {
    modelValue: {
      type: [String, Number, Object] as PropType<any>,
      default: false,
    },
  },

  setup(props, { slots }) {
    return () => <VSheet class={'v-tab-items'}></VSheet>
  },
})
