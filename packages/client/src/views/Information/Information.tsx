import { computed, defineComponent, TransitionGroup } from 'vue'
import { VCard, VSheet } from 'lopr-ui'
import { useCertificateStore } from '../../stores/certificates'
import { VCertificate, VSizeChart } from '../../components'

export const Information = defineComponent({
  name: 'app-information',
  setup() {
    const certStore = useCertificateStore()
    const certificates = computed(() =>
      [...certStore.certificates].toSorted().map((certFile) => {
        const file = `file://${certFile.replace(/\\/, '/')}`
        const cert = file.substring(file.lastIndexOf('/') + 1, file.lastIndexOf('.'))
        return { cert, file }
      })
    )
    return () => (
      <VSheet class={['fill-height']}>
        <VCard flat class={['fill-height', 'overflow-auto', 'flex-grow-1', 'pa-3']}>
          <h2>Information</h2>
          <VSizeChart />
          <h3 class={['mt-6']}>Certificates</h3>
          The root certificate should be trusted on your system, in order for SSH tunneling to work.
          <VCertificate host={'root'} tooltip={'The root certificate is the one from which all other certificates are generated.'} class={['mt-1']} />
          <h4 class={['mt-6']}>Intermediate certificates</h4>
          <div class={['d-flex', 'gap-2', 'flex-wrap']}>
            {!certStore.isEmpty ? (
              <TransitionGroup>
                {certificates.value.map(({ file, cert }) => (
                  <VCertificate key={cert} host={cert} />
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
