import { defineComponent } from 'vue'
import { VSheet } from '../../core'
import { PlayPauseButton } from '../PlayPauseButton'
import { useAppStore } from '../../../stores/app'

export const AppControlsToolbar = defineComponent({
  name: 'AppControlsToolbar',

  setup() {
    const appStore = useAppStore()
    return () => (
      <VSheet class={['v-app-controls']}>
        <PlayPauseButton v-model:recording={appStore.recording} />
      </VSheet>
    )
  },
})
