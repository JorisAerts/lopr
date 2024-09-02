import type { CSSProperties } from 'vue'
import { defineComponent } from 'vue'
import { VCard, VIcon, VTooltip } from 'lopr-ui'

export const VCertificate = defineComponent({
  name: 'VCertificate',

  props: {
    host: { type: String },
  },

  setup(props, { emit }) {
    return () => (
      <VCard class={['pa-2', 'd-flex', 'align-items-center', 'overflow-ellipsis']} key={props.host} style={{ width: 'calc(20% - 8px)' }}>
        <VIcon name={'ShieldLock'} class={'mr-2'} size={33} style={{ float: 'left' }} />
        <VTooltip text={props.host}>
          <a href={`/api/data?cert=${props.host}`} download={`${props.host}.crt`}>
            <span style={{ 'word-wrap': 'break-word' as CSSProperties['word-wrap'] }}>{props.host}</span>
          </a>
        </VTooltip>
      </VCard>
    )
  },
})
