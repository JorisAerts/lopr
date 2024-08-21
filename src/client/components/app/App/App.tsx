import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import { VSheet } from '../../ui'
import { VAppHeader } from '../AppHeader'
import { VNavBar } from '../NavBar'

export const App = defineComponent({
  name: 'v-app',

  setup() {
    // the application entry point
    return () => (
      <VSheet class={['d-flex', 'flex-column', 'fill-height']}>
        <VAppHeader />
        <VNavBar class={['mb-2', 'flex-grow-0']} />
        <VSheet class={['flex-grow-1', 'overflow-y-auto']}>
          <RouterView />
        </VSheet>
      </VSheet>
    )
  },
})
