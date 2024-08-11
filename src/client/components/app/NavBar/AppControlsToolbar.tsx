import './AppControlsToolbar.scss'
import { defineComponent } from 'vue'
import { VBtn, VSheet } from '../../core'
import { PlayPauseButton } from '../PlayPauseButton'
import { useAppStore } from '../../../stores/app'

export const AppControlsToolbar = defineComponent({
  name: 'AppControlsToolbar',

  setup() {
    const appStore = useAppStore()
    return () => (
      <VSheet class={['v-app-controls-toolbar']}>
        <PlayPauseButton v-model:recording={appStore.recording} />
        <VBtn class={['align-center', 'pa-1']} icon={'Delete'} size={22} transparent onClick={() => {}} />
      </VSheet>
    )
  },
})
