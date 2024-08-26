import { defineComponent } from 'vue'
import { VCard, VCheckbox, VTooltip } from 'js-proxy-ui/components'
import { usePreferencesStore } from '../../stores/preferences'

export const AppPreferences = defineComponent({
  name: 'AppPreferences',

  setup() {
    const preferencesStore = usePreferencesStore()
    return () => (
      <VCard class={['fill-height', 'overflow-auto', 'flex-grow-1', 'd-flex', 'flex-column', 'pa-3', 'gap-2']}>
        <h2 class={'mb-2'}>Preferences</h2>
        <VCard class={['pa-3']}>
          <h3 class={'mb-2'}>Appearance</h3>
          <VCheckbox label={'Dark Mode'} v-model={preferencesStore.isDark} />
        </VCard>
        <VCard class={['pa-3']}>
          <h3 class={'mb-2'}>Reverse Proxy</h3>
          <VTooltip text={'SSL Certificates will be spoofed, \nso that the transmitted data can be inspected.'}>
            <VCheckbox label={'Enable SSL Proxying'} v-model={preferencesStore.proxySSL} />
          </VTooltip>
        </VCard>
      </VCard>
    )
  },
})
