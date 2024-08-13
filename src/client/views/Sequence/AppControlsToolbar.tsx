import './AppControlsToolbar.scss'
import { defineComponent } from 'vue'
import { VBtn, VSheet, VSwitch, VTooltip } from '../../components/core'
import { useAppStore } from '../../stores/app'
import { useRequestStore } from '../../stores/request'

export const AppControlsToolbar = defineComponent({
  name: 'AppControlsToolbar',

  setup() {
    const appStore = useAppStore()
    const requestStore = useRequestStore()
    return () => (
      <VSheet class={['v-app-controls-toolbar', 'gap-2']}>
        <VTooltip text={'Play/Pause'}>
          <VSwitch v-model:checked={appStore.recording} onIcon={'PlayArrow_Fill'} offIcon={'Pause_Fill'} />
        </VTooltip>
        <VBtn tooltip="Clear all requests" class={['align-center', 'pa-1']} icon={'Delete'} size={20} transparent onClick={requestStore.clear} />
      </VSheet>
    )
  },
})
