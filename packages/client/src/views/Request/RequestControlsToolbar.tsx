import { defineComponent } from 'vue'
import { VBtn, VCard, VDialog, VSwitch, VToolbar } from 'js-proxy-ui'
import { useAppStore } from '../../stores/app'
import { useRequestStore } from '../../stores/request'
import { VBreakpoints } from '../../components'

export const RequestControlsToolbar = defineComponent({
  name: 'ControlsToolbar',

  setup() {
    const appStore = useAppStore()
    const requestStore = useRequestStore()
    return () => (
      <VToolbar class={['v-app-controls-toolbar']}>
        <VSwitch tooltip={'Play/Pause'} v-model:checked={appStore.recording} onIcon={'PlayArrow_Fill'} offIcon={'Pause_Fill'} />
        <VDialog clickOutsideToClose>
          {{
            activator: ({ props }: { props: Record<string, unknown> }) => (
              <VBtn tooltip="VBreakpoints" class={['align-center', 'pa-1']} icon={'Dangerous_Fill'} size={20} transparent {...props} />
            ),
            default: () => (
              <VCard class={['pa-2']}>
                <h3>VBreakpoints</h3>
                <VBreakpoints class={['mt-2']} />
              </VCard>
            ),
          }}
        </VDialog>
        <VBtn tooltip="Clear all requests" class={['align-center', 'pa-1']} icon={'Delete'} size={20} transparent onClick={requestStore.clear} />
      </VToolbar>
    )
  },
})
