import { defineComponent } from 'vue'
import { Breakpoints, VBtn, VCard, VDialog, VSwitch, VToolbar, VTooltip } from '../../components'
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
        <VDialog clickOutsideToClose>
          {{
            activator: ({ props }: { props: Record<string, unknown> }) => (
              <VBtn tooltip="Breakpoints" class={['align-center', 'pa-1']} icon={'Dangerous_Fill'} size={20} transparent {...props} />
            ),
            default: () => (
              <VCard class={['pa-2']}>
                <h3>Breakpoints</h3>
                <Breakpoints class={['mt-2']} />
              </VCard>
            ),
          }}
        </VDialog>
        <VBtn tooltip="Clear all requests" class={['align-center', 'pa-1']} icon={'Delete'} size={20} transparent onClick={requestStore.clear} />
      </VToolbar>
    )
  },
})
