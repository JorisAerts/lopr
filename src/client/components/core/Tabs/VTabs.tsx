import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import { VSheet } from '../Sheet'
import './VTabs.scss'
import { VContainer } from '../Container'

export const VTabs = defineComponent({
  name: 'v-tabs',

  props: {
    modelValue: {
      type: [String, Number, Object] as PropType<any>,
    },
  },

  setup(props, { slots }) {
    return () => (
      <VSheet class={'v-tabs'}>
        <VContainer class={'v-tabs--items'}> {slots.default?.()}</VContainer>
      </VSheet>
    )
  },
})
