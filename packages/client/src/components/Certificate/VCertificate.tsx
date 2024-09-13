import type { CSSProperties } from 'vue'
import { defineComponent } from 'vue'
import { VCard, VIcon, VTooltip } from 'lopr-ui'

export const VCertificate = defineComponent({
  name: 'VCertificate',

  props: {
    host: { type: String },
    tooltip: { type: String },
  },

  setup(props, { slots }) {
    return () => (
      <VCard class={['pa-2', 'd-flex', 'align-items-center', 'overflow-ellipsis']} style={{ width: 'calc(20% - 8px)' }}>
        <VIcon name={'ShieldLock_Fill'} class={'mr-2'} size={33} style={{ float: 'left' }} />
        <VTooltip text={props.tooltip ?? props.host}>
          <a href={`/api/data?cert=${props.host}`}>
            <span style={{ 'word-wrap': 'break-word' as CSSProperties['word-wrap'] }}>{slots.default?.() ?? props.host}</span>
          </a>
        </VTooltip>
      </VCard>
    )
  },
})
