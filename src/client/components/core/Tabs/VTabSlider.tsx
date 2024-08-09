import './VTabs.scss'
import { defineComponent } from 'vue'
import { defineTabs } from './tabs'

export const VTabSlider = defineComponent({
  name: 'v-tab-slider',

  setup(props, { slots }) {
    defineTabs(props)
    return () => <div class={'v-tab-slider'}></div>
  },
})
