import { defineComponent } from 'vue'
import { VBtn, VToolbar } from '../../components'
import { useErrorLogStore } from '../../stores/errorlog'

export const ErrorLogControlsToolbar = defineComponent({
  name: 'ControlsToolbar',

  setup() {
    const errorLogStore = useErrorLogStore()
    return () => (
      <VToolbar class={['v-app-controls-toolbar']}>
        <VBtn tooltip="Clear error log" class={['align-center', 'pa-1']} icon={'Delete'} size={20} transparent onClick={errorLogStore.clear} />
      </VToolbar>
    )
  },
})
