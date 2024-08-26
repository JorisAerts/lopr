import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import { VSheet } from 'js-proxy-ui/components'
import { VAppHeader } from '../AppHeader'
import { VNavBar } from '../NavBar'
import { useHtmlDarkMode } from 'js-proxy-ui'

export const App = defineComponent({
  name: 'v-app',

  setup() {
    useHtmlDarkMode()
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
