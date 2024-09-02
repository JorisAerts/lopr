import { defineComponent } from 'vue'
import { VBtn, VToolbar } from 'js-proxy-ui'
import { useErrorLogStore } from '../../stores/errorlog'

export const ErrorLogControlsToolbar = defineComponent({
  name: 'ErrorLogControlsToolbar',

  setup() {
    const errorLogStore = useErrorLogStore()
    return () => (
      <VToolbar class={['v-app-controls-toolbar']}>
        <VBtn class={['align-center', 'py-1']} icon={'Delete'} size={20} transparent onClick={errorLogStore.clear}>
          Clear logs
        </VBtn>
      </VToolbar>
    )
  },
})
