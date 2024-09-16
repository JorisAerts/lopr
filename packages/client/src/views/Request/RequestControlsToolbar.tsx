import { defineComponent, ref } from 'vue'
import { VBtn, VDialog, VDialogCard, VDialogTitle, VSwitch, VToolbar } from 'lopr-ui'
import { useCache } from '../../stores/cache'
import { VBreakpoints } from '../../components'
import { useProxyStore } from '../../stores/proxy'

export const RequestControlsToolbar = defineComponent({
  name: 'RequestControlsToolbar',

  setup() {
    const proxyStore = useProxyStore()
    const requestStore = useCache()
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
                <VDialogTitle>Breakpoints</VDialogTitle>
                <VBreakpoints class={['mt-2']} onClose={() => (dlg.value = false)} />
              </VDialogCard>
            ),
          }}
        </VDialog>
        <VBtn class={['align-center', 'py-1']} icon={'Delete'} size={20} transparent onClick={() => requestStore.clear()}>
          Clear history
        </VBtn>
      </VToolbar>
    )
  },
})
