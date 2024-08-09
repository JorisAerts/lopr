import { defineComponent, TransitionGroup } from 'vue'
import { VBtn, VCard, VSheet } from '../components'
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
