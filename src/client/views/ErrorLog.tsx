import { defineComponent } from 'vue'
import { VCard, VSheet } from '../components'
import { useErrorLogStore } from '../stores/errorlog'

export const ErrorLog = defineComponent({
  name: 'error-log',

  setup() {
    const errorLogStore = useErrorLogStore()
    return () => (
      <VSheet class={['fill-height', 'gap-2']}>
        <VCard class={['fill-height', 'overflow-auto', 'flex-grow-1', 'pa-3']}>
          <h2 class={'mb-4'}>Error log</h2>
          <VSheet class={['d-flex', 'flex-column', 'gap-2']}>
            {errorLogStore.errors.map((err) => (
              <VCard class={['pa-2', 'd-flex', 'flex-column']}>
                {err.ts && (
                  <div>
                    <label>Timestamp</label>: {err.ts.toLocaleString()}
                  </div>
                )}
                {err.err && (
                  <>
                    {err.err.name && (
                      <div>
                        <label>Name</label>: {err.err.name}
                      </div>
                    )}
                    {err.err.message && (
                      <div>
                        <label>Message</label>: {err.err.message}
                      </div>
                    )}
                  </>
                )}
                {}
              </VCard>
            ))}
          </VSheet>
        </VCard>
      </VSheet>
    )
  },
})
