import { defineComponent } from 'vue'
import { VBtn, VSwitch, VToolbar, VTooltip } from '../../components/core'
import { useAppStore } from '../../stores/app'
import { useRequestStore } from '../../stores/request'

export const RequestControlsToolbar = defineComponent({
  name: 'ControlsToolbar',

  setup() {
    const appStore = useAppStore()
    const requestStore = useRequestStore()
    return () => (
      <VToolbar class={['v-app-controls-toolbar']}>
        <VTooltip text={'Play/Pause'}>
          <VSwitch v-model:checked={appStore.recording} onIcon={'PlayArrow_Fill'} offIcon={'Pause_Fill'} />
        </VTooltip>
        <VBtn tooltip="Clear all requests" class={['align-center', 'pa-1']} icon={'Delete'} size={20} transparent onClick={requestStore.clear} />
      </VToolbar>
    )
  },
})
