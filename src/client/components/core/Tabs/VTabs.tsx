import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import { VSheet } from '../Sheet'
import './VTabs.scss'
import { VContainer } from '../Container'
import { defineTabs, makeTabsProps } from './tabs'

export const VTabs = defineComponent({
  name: 'v-tabs',

  props: {
    modelValue: {
      ...makeTabsProps(),
      type: [String, Number, Object] as PropType<any>,
    },
  },

  setup(props, { slots }) {
    defineTabs(props)
    return () => (
      <VSheet class={'v-tabs'}>
        <VContainer class={'v-tabs--items'}> {slots.default?.()}</VContainer>
      </VSheet>
    )
  },
})
