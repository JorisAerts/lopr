import { defineComponent } from 'vue'
import { VBtn, VToolbar } from 'lopr-ui'
import { useRequestStore } from '../../stores/request'

export const InformationControlsToolbar = defineComponent({
  name: 'InformationControlsToolbar',

  setup() {
    const requestStore = useRequestStore()
    return () => (
      <VToolbar class={['v-app-controls-toolbar']}>
        <VBtn class={['align-center', 'py-1']} icon={'Delete'} size={20} transparent onClick={requestStore.clear}>
          Clear cache
        </VBtn>
        <VBtn disabled class={['align-center', 'py-1']} icon={'Delete'} size={20} transparent>
          Clear certificates
        </VBtn>
      </VToolbar>
    )
  },
})
