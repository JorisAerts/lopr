import { defineComponent, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import { VAppHeader, VNavBar } from '../../app'
import { useErrorLogStore } from '../../../stores/errorlog'
import { useRequestStore } from '../../../stores/request'

export const App = defineComponent({
  name: 'v-app',

  props: {
    beSure: { type: Boolean, default: true },
  },

  setup(props) {
    // init stores that automagically will register web socket handlers
    useErrorLogStore()
    useRequestStore()

    if (props.beSure) {
      const beSure = (event: BeforeUnloadEvent) => {
        const question = 'Refresh will clear all data.\nTherefore, are you sure?'
        event.preventDefault()
        event.returnValue = question
        return question
      }
      window.addEventListener('beforeunload', beSure)
      onUnmounted(() => window.removeEventListener('beforeunload', beSure))
    }

    // the application entry point
    return () => (
      <div class={['d-flex', 'flex-column', 'fill-height']}>
        <VAppHeader />
        <VNavBar class={['mb-2', 'flex-grow-0']} />
        <div class={['flex-grow-1', 'overflow-y-auto']}>
          <RouterView />
        </div>
      </div>
    )
  },
})
