import { defineComponent } from 'vue'
import './VSpacer.scss'

export const VSpacer = defineComponent({
  name: 'v-spacer',

  setup() {
    return () => <div class={'v-spacer'}></div>
  },
})
