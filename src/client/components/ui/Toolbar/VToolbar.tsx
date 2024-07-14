import './VToolbar.scss'
import { defineComponent } from 'vue'
import { VSheet } from '../Sheet'

export const VToolbar = defineComponent({
  name: 'v-toolbar',

  setup(props, { slots }) {
    return () => <VSheet class={['v-toolbar']}>{slots.default?.()}</VSheet>
  },
})
