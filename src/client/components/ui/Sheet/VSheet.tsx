import { defineComponent } from 'vue'

export const VSheet = defineComponent({
  name: 'v-sheet',

  setup(props, { slots }) {
    return () => <div class={'v-sheet'}>{slots.default?.()}</div>
  },
})
