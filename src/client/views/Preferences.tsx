import { defineComponent } from 'vue'
import { VCard, VCheckbox, VSheet, VTooltip } from '../components'
import { usePreferencesStore } from '../stores/preferences'

export const Preferences = defineComponent({
  name: 'app-preferences',

  setup() {
    const preferencesStore = usePreferencesStore()

    return () => (
      <VSheet class={['fill-height']}>
        <VCard class={['fill-height', 'overflow-auto', 'flex-grow-1', 'd-flex', 'flex-column', 'pa-3', 'gap-2']}>
          <h2 class={'mb-2'}>Preferences</h2>
          <VCard class={['pa-3']}>
            <h3 class={'mb-2'}>Appearance</h3>
            <VCheckbox label={'Dark Mode'} modelValue={true} disabled />
          </VCard>
          <VCard class={['pa-3']}>
            <h3 class={'mb-2'}>Reverse Proxy</h3>
            <VTooltip text={'SSL Certificates will be spoofed, \nso that the transmitted data can be inspected.'}>
              <VCheckbox label={'Enable SSL Proxying'} v-model={preferencesStore.proxySSL} />
            </VTooltip>
          </VCard>
        </VCard>
      </VSheet>
    )
  },
})
