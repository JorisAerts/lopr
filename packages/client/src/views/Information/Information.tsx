import { computed, defineComponent, ref, Transition, TransitionGroup } from 'vue'
import { VCard, VSheet, VTextField } from 'lopr-ui'
import { useCertificateStore } from '../../stores/certificates'
import { VCertificate, VSizeChart } from '../../components'

export const Information = defineComponent({
  name: 'app-information',
  setup() {
    const certStore = useCertificateStore()
    const certFilter = ref('')

    const certificates = computed(() =>
      [...certStore.certificates]
        .toSorted()
        .map((certFile) => {
          const file = `file://${certFile.replace(/\\/, '/')}`
          const cert = file.substring(file.lastIndexOf('/') + 1, file.lastIndexOf('.'))
          return { cert, file }
        })
        .filter((cert) => !certFilter.value || cert.cert.indexOf(certFilter.value) > -1)
    )

    return () => (
      <VSheet class={['fill-height']}>
        <VCard flat class={['fill-height', 'overflow-auto', 'flex-grow-1', 'pa-3']}>
          <h2>Information</h2>
          <VSizeChart />
          <h3 class={['mt-6']}>Certificates</h3>
          The root certificate should be trusted on your system, in order for SSH tunneling to work.
          <VCertificate host={'root'} tooltip={'The root certificate is the one from which all other certificates are generated.'} class={['mt-4']} />
          <h4 class={['mt-6']}>
            <span>Intermediate certificates</span>
            {!certStore.isEmpty && (
              <Transition>
                <div class={['ml-2', 'd-inline-block']}>
                  <VTextField class={['pa-0', 'px-1']} placeholder={'Filter'} v-model={certFilter.value} />
                </div>
              </Transition>
            )}
          </h4>
          <div class={['d-flex', 'gap-2', 'flex-wrap', 'pt-2']}>
            {certificates.value.length ? (
              <TransitionGroup>
                {certificates.value.map(({ cert }) => (
                  <VCertificate key={cert} tooltip={cert}>
                    {cert}
                  </VCertificate>
                ))}
              </TransitionGroup>
            ) : (
              'No intermediate certificates generated yet'
            )}
          </div>
        </VCard>
      </VSheet>
    )
  },
})
