import { defineComponent, TransitionGroup } from 'vue'
import { VBtn, VCard, VSheet } from '../../components'
import { useErrorLogStore } from '../../stores/errorlog'

export const ErrorLog = defineComponent({
  name: 'error-log',

  setup() {
    const errorLogStore = useErrorLogStore()
    return () => (
      <VSheet class={['fill-height', 'gap-2']}>
        <VCard class={['fill-height', 'overflow-auto', 'flex-grow-1', 'pa-3']}>
          <h2 class={'mb-4'}>Error log</h2>
          <VSheet class={['d-flex', 'flex-column', 'gap-2']}>
            <TransitionGroup>
              {errorLogStore.errors.map((err, index) => (
                <VCard class={['pa-2', 'd-flex']} key={err.key}>
                  <VBtn class={['align-center', 'pa-1']} icon={'Delete'} size={22} transparent onClick={() => errorLogStore.errors.splice(index, 1)} />
                  <VSheet class={['pa-2', 'd-flex', 'flex-column', 'flex-grow-0']}>
                    {err.ts && (
                      <div>
                        <label>Timestamp</label>: {err.ts.toLocaleString()}
                      </div>
                    )}
                    {err.src && (
                      <div>
                        <label>Source</label>: {typeof err.src === 'string' || typeof err.src === 'number' ? err.src : JSON.stringify(err.src, null, 2)}
                      </div>
                    )}
                    {err.err && (
                      <pre class={['mt-2', 'text-mono']}>
                        {Object.keys(err.err).length //
                          ? JSON.stringify(err.err, null, 2)
                          : undefined}
                      </pre>
                    )}
                  </VSheet>
                </VCard>
              ))}
            </TransitionGroup>
          </VSheet>
        </VCard>
      </VSheet>
    )
  },
})
