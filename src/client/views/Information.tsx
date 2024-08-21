import { computed, defineComponent, TransitionGroup } from 'vue'
import { VCard, VIcon, VSheet } from '../components'
import { useCertificateStore } from '../stores/certificates'

export const Information = defineComponent({
  name: 'app-information',
  setup() {
    const certStore = useCertificateStore()
    const certificates = computed(() =>
      certStore.certificates?.toSorted().map((certFile) => {
        const file = `file://${certFile.replace(/\\/, '/')}`
        const cert = file.substring(file.lastIndexOf('/') + 1, file.lastIndexOf('.'))
        return { cert, file }
      })
    )
    return () => (
      <VSheet class={['fill-height']}>
        <VCard class={['fill-height', 'overflow-auto', 'flex-grow-1', 'pa-3']}>
          <h2>Information</h2>
          Some practical info.
          <h3 class={['mt-6']}>Certificates</h3>
          <div class={['d-flex', 'mt-4', 'gap-2', 'flex-wrap']}>
            {certStore.certificates.length ? (
              <TransitionGroup>
                {certificates.value.map(({ file, cert }) => (
                  <VCard class={['pa-2']} key={file}>
                    <a href={file} target={'cert'}>
                      <VIcon name={'ShieldLock'} /> {cert}
                    </a>
                  </VCard>
                ))}
              </TransitionGroup>
            ) : (
              'No certificate generated yet'
            )}
          </div>
        </VCard>
      </VSheet>
    )
  },
})
