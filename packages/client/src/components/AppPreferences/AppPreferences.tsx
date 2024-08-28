import { defineComponent } from 'vue'
import { VCard, VCheckbox, VLabel, VSwitch, VTooltip } from 'js-proxy-ui/components'
import { usePreferencesStore } from '../../stores/preferences'

export const AppPreferences = defineComponent({
  name: 'AppPreferences',

  setup() {
    const preferencesStore = usePreferencesStore()
    return () => (
      <VCard class={['fill-height', 'overflow-auto', 'flex-grow-1', 'd-flex', 'flex-column', 'pa-3', 'gap-2']}>
        <h2 class={'mb-2'}>Preferences</h2>
        <VCard class={['pa-3']}>
          <h3>Appearance</h3>
          <VLabel class={['d-flex', 'flex-row']} style={{ '--input-label-font-weight': 'initial' }}>
            <span class={['pr-1']} style={{ margin: 'auto 0' }}>
              Dark Mode:
            </span>{' '}
            <VSwitch v-model:checked={preferencesStore.isDark}></VSwitch>
          </VLabel>
        </VCard>
        <VCard class={['pa-3']}>
          <h3>Reverse Proxy</h3>
          <VTooltip text={'SSL Certificates will be spoofed, \nso that the transmitted data can be inspected.'}>
            <VCheckbox label={'Enable SSL Proxying'} v-model={preferencesStore.proxySSL} />
          </VTooltip>
        </VCard>
      </VCard>
    )
  },
})
