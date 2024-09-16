import { defineComponent } from 'vue'
import { VBtn, VToolbar } from 'lopr-ui'
import { useCache } from '../../stores/cache'

export const InformationControlsToolbar = defineComponent({
  name: 'InformationControlsToolbar',

  setup() {
    const cache = useCache()
    return () => (
      <VToolbar class={['v-app-controls-toolbar']}>
        <VBtn class={['align-center', 'py-1']} icon={'Delete'} size={20} transparent onClick={() => cache.clear()}>
          Clear cache
        </VBtn>
        <VBtn disabled class={['align-center', 'py-1']} icon={'Delete'} size={20} transparent>
          Clear certificates
        </VBtn>
      </VToolbar>
    )
  },
})
