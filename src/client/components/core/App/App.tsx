import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import { VAppHeader, VNavBar } from '../../app'

export const App = defineComponent({
  name: 'v-app',

  setup() {
    return () => (
      <div class={['d-flex', 'flex-column', 'fill-height']}>
        <VAppHeader />
        <VNavBar class={['mb-2']} />
        <RouterView />
      </div>
    )
  },
})
