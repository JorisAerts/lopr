import { defineComponent, ref } from 'vue'
import { VBtn, VDialog, VDialogCard, VSwitch, VToolbar } from 'lopr-ui'
import { useRequestStore } from '../../stores/request'
import { VBreakpoints } from '../../components'
import { useProxyStore } from '../../stores/proxy'

export const RequestControlsToolbar = defineComponent({
  name: 'RequestControlsToolbar',

  setup() {
    const proxyStore = useProxyStore()
    const requestStore = useRequestStore()
    const dlg = ref(false)
    return () => (
      <VToolbar class={['v-app-controls-toolbar']}>
        <VSwitch tooltip={'Play/Pause'} v-model:checked={proxyStore.recording} onIcon={'PlayArrow_Fill'} offIcon={'Pause_Fill'} />
        <VDialog escapeToClose v-model={dlg.value}>
          {{
            activator: ({ props }: { props: Record<string, unknown> }) => (
              <VBtn tooltip="Breakpoints" class={['align-center', 'pa-1']} icon={'Dangerous_Fill'} size={20} transparent {...props} />
            ),
            default: () => (
              <VDialogCard class={['pa-2']}>
                <h3>Breakpoints</h3>
                <VBreakpoints class={['mt-2']} onClose={() => (dlg.value = false)} />
              </VDialogCard>
            ),
          }}
        </VDialog>
        <VBtn class={['align-center', 'py-1']} icon={'Delete'} size={20} transparent onClick={requestStore.clear}>
          Clear history
        </VBtn>
      </VToolbar>
    )
  },
})
