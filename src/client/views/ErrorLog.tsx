import { defineComponent } from 'vue'
import { VCard, VSheet } from '../components'
import { useErrorLogStore } from '../stores/errorlog'

export const Sequence = defineComponent({
  name: 'error-log',

  setup() {
    const errorLogStore = useErrorLogStore()
    return () => (
      <VSheet class={['fill-height', 'gap-2']}>
        <VCard class={['fill-height', 'overflow-auto', 'flex-grow-1', 'pa-3']}>
          <h2>Error log</h2>
          <VSheet class={['d-flex', 'flex-column', 'gap-2']}>
            {errorLogStore.errors.map((err) => (
              <VCard>
                {err.ts && <div>Timestamp: {err.ts.toLocaleString()}</div>}
                {err.name && <div>name: {err.name}</div>}
                {err.message && <div>message: {err.message}</div>}
              </VCard>
            ))}
          </VSheet>
        </VCard>
      </VSheet>
    )
  },
})
