import type { PropType, Ref } from 'vue'
import { computed, defineComponent, shallowRef } from 'vue'
import { RequestSequence, VBtn, VCard, VContainer, VSheet, VSpacer, VTooltip } from '../components'
import type { ProxyRequestInfo } from '../../shared/Request'
import { RequestDetails } from '../components/app/RequestDetails/RequestDetails'

export const Sequence = defineComponent({
  name: 'requests-monitor',

  props: {
    width: {
      type: [Number, String] as PropType<number | string>,
      default: 320,
    },
  },

  setup(props) {
    const current: Ref<ProxyRequestInfo | undefined> = shallowRef()

    const width = computed(() => (typeof props.width === 'number' ? `${props.width}px` : props.width))

    return () => (
      <VContainer class={['fill-height', 'gap-2']}>
        <VCard
          class={['fill-height', 'py-2', 'd-flex', 'flex-column']}
          style={{
            width: width.value,
            'max-width': width.value,
          }}
        >
          <VSheet class={['d-flex', 'px-3']}>
            <h3>Requests</h3>
            <VSpacer />
            <VTooltip text={'Sequence view'}>
              <VBtn icon={'Reorder'} size={20} class={['pa-1', 'mr-1']} transparent />
            </VTooltip>
            <VTooltip text={'Structure view'}>
              <VBtn icon={'AccountTree'} size={20} class={['pa-1']} transparent disabled />
            </VTooltip>
          </VSheet>
          <RequestSequence v-model={current.value} />
        </VCard>

        <VCard class={['fill-height', 'overflow-auto', 'flex-grow-1', 'pa-3']}>
          <RequestDetails modelValue={current.value} />
        </VCard>
      </VContainer>
    )
  },
})
