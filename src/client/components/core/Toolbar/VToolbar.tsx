import { defineComponent } from 'vue'
import { VSheet } from '../Sheet'

export const VToolbar = defineComponent({
  name: 'v-toolbar',

  setup(props, { slots }) {
    return () => <VSheet class={['v-toolbar', 'gap-2']}>{slots.default?.()}</VSheet>
  },
})
