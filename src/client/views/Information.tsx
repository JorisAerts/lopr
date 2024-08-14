import { defineComponent, TransitionGroup } from 'vue'
import { VCard, VIcon, VSheet } from '../components'
import { useCertificateStore } from '../stores/certificates'

export const Information = defineComponent({
  name: 'app-information',

  props: {},

  setup(props) {
    const certStore = useCertificateStore()

    return () => (
      <VSheet class={['fill-height']}>
        <VCard class={['fill-height', 'overflow-auto', 'flex-grow-1', 'pa-3']}>
          <h2>Information</h2>
          Some practical info.
          <h3 class={['d-flex', 'align-items-center', 'mt-6']}>
            <VIcon name={'ShieldLock'} size={22} />
            Certificates
          </h3>
          <div class={['d-flex', 'mt-4', 'gap-2', 'flex-wrap']}>
            <TransitionGroup>
              {certStore.certificates.map((certFile) => {
                const file = `file://${certFile.replace(/\\/, '/')}`
                const cert = file.substring(file.lastIndexOf('/') + 1, file.lastIndexOf('.'))
                return (
                  <VCard class={['pa-2']} key={file}>
                    <a href={file} target={'cert'}>
                      <VIcon name={'ShieldLock'} /> {cert}
                    </a>
                  </VCard>
                )
              })}
            </TransitionGroup>
          </div>
        </VCard>
      </VSheet>
    )
  },
})
