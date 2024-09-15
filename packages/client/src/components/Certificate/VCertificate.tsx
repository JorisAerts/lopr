import type { CSSProperties } from 'vue'
import { defineComponent } from 'vue'
import { makeTooltipProps, useTooltip, VCard, VIcon, VTooltip } from 'lopr-ui'

export const VCertificate = defineComponent({
  name: 'VCertificate',

  props: {
    ...makeTooltipProps(),
    host: { type: String },
  },

  setup(props, { slots }) {
    const { wrapWithTooltip } = useTooltip(props, slots)

    return () => (
      <VCard class={['pa-2', 'd-flex', 'align-items-center', 'overflow-ellipsis']} style={{ width: 'calc(20% - 8px)' }}>
        <VIcon name={'ShieldLock_Fill'} class={'mr-2'} size={33} style={{ float: 'left' }} />
        {wrapWithTooltip(
          <a href={`/api/data?cert=${props.host}`}>
            <span style={{ 'word-wrap': 'break-word' as CSSProperties['word-wrap'] }}>{slots.default?.() ?? props.host}</span>
          </a>
        )}
        <VTooltip text={props.tooltip ?? props.host}></VTooltip>
      </VCard>
    )
  },
})
