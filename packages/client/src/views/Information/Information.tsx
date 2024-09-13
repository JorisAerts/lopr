import { computed, defineComponent, ref, Transition, TransitionGroup, watch } from 'vue'
import { VCard, VLabel, VPieChart, VSheet } from 'lopr-ui'
import { useCertificateStore } from '../../stores/certificates'
import { toBytes } from '../../utils/to-bytes'
import { useAppStore } from '../../stores/app'
import { VCertificate } from '../../components'

export const Information = defineComponent({
  name: 'app-information',
  setup() {
    const certStore = useCertificateStore()
    const appStore = useAppStore()
    const cachedSizes = ref()
    watch(
      () => appStore.sizes,
      () => appStore.sizes != null && (cachedSizes.value = { ...appStore.sizes, cacheSizes: 0, ...appStore.sizes.cacheSizes }),
      { immediate: true, deep: true }
    )

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
          <VSheet class={['d-flex', 'gap-4']}>
            <VPieChart values={Object.entries(cachedSizes.value ?? {}).map(([, value]) => ({ value: value as number }))} style={{ height: '75px' }} borderWidth={0.75} />
            <VSheet>
              <div>
                <VLabel class={['d-inline']}>Cache Size</VLabel>: <Transition>{toBytes(cachedSizes.value?.cacheSize)}</Transition>
              </div>
              <div>
                <VLabel class={['d-inline']}>Certificates Size</VLabel>: <Transition>{toBytes(cachedSizes.value?.certSize)}</Transition>
              </div>
            </VSheet>
          </VSheet>
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
