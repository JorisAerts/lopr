import { defineComponent } from 'vue'
import './VTable.scss'

export const VTable = defineComponent({
  name: 'v-table',

  setup(props, { slots }) {
    return () => <table class={['v-table']}>{slots.default?.()}</table>
  },
})
