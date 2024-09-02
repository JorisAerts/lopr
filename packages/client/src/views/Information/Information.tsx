import type { CSSProperties } from 'vue'
import { computed, defineComponent, onMounted, TransitionGroup } from 'vue'
import { VCard, VIcon, VLabel, VPieChart, VSheet, VTooltip } from 'js-proxy-ui'
import { useCertificateStore } from '../../stores/certificates'
import { toBytes } from '../../utils/to-bytes'
import { useAppStore } from '../../stores/app'

export const Information = defineComponent({
  name: 'app-information',
  setup() {
    const certStore = useCertificateStore()
    const appStore = useAppStore()

    onMounted(() => (appStore.sizes = undefined))

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
            <VPieChart values={Object.entries(appStore.sizes ?? {}).map(([, value]) => ({ value: value as number }))} style={{ height: '75px' }} borderWidth={0.75} />
            <VSheet>
              <div>
                <VLabel class={['d-inline']}>Cache Size</VLabel>: {toBytes(appStore.sizes?.cacheSize)}
              </div>
              <div>
                <VLabel class={['d-inline']}>Certificates Size</VLabel>: {toBytes(appStore.sizes?.certSize)}
              </div>
            </VSheet>
          </VSheet>
          <h3 class={['mt-6']}>Certificates</h3>
          Below is a list of generated certificated which will be spoofed into HTTPS calls.
          <div class={['d-flex', 'mt-4', 'gap-2', 'flex-wrap']}>
            {!certStore.isEmpty ? (
              <TransitionGroup>
                {certificates.value.map(({ file, cert }) => (
                  <VCard class={['pa-2', 'd-flex', 'align-items-center', 'overflow-ellipsis']} key={file} style={{ width: 'calc(20% - 8px)' }}>
                    <VIcon name={'ShieldLock'} class={'mr-2'} size={33} style={{ float: 'left' }} />
                    <VTooltip text={cert}>
                      <a href={`/api/data?cert=${cert}`} download={`${cert}.crt`}>
                        <span style={{ 'word-wrap': 'break-word' as CSSProperties['word-wrap'] }}>{cert}</span>
                      </a>
                    </VTooltip>
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
