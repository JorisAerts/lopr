import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import { VAppHeader, VNavBar } from '../../app'
import { useErrorLogStore } from '../../../stores/errorlog'
import { useRequestStore } from '../../../stores/request'

export const App = defineComponent({
  name: 'v-app',

  setup() {
    // init stores that automagically will register web socket handlers
    useErrorLogStore()
    useRequestStore()
    // the application entry point
    return () => (
      <div class={['d-flex', 'flex-column', 'fill-height']}>
        <VAppHeader />
        <VNavBar class={['mb-2']} />
        <RouterView />
      </div>
    )
  },
})
