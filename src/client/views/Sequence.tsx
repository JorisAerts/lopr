import type { PropType, Ref } from 'vue'
import { computed, defineComponent, ref } from 'vue'
import { RequestDetails, RequestSequence, RequestStructure, VBtn, VCard, VContainer, VSheet, VSpacer, VTooltip } from '../components'
import { useRequestStore } from '../stores/request'
import type { UUID } from '../../shared/UUID'

export const Sequence = defineComponent({
  name: 'requests-monitor',

  props: {
    width: { type: [Number, String] as PropType<number | string>, default: 320 },
  },

  setup(props) {
    const requestStore = useRequestStore()
    const current: Ref<UUID | undefined> = ref()
    const width = computed(() => (typeof props.width === 'number' ? `${props.width}px` : props.width))

    const requestViewType = ref(1)
    const expanded = ref<string[]>([])

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
            <h3>
              Requests <sup>({requestStore.ids.length})</sup>
            </h3>
            <VSpacer />
            <VTooltip text={'Sequence view'}>
              <VBtn icon={'Reorder'} size={20} class={['pa-1', 'mr-1']} transparent onClick={() => (requestViewType.value = 0)} />
            </VTooltip>
            <VTooltip text={'Structure view'}>
              <VBtn icon={'AccountTree'} size={20} class={['pa-1']} transparent onClick={() => (requestViewType.value = 1)} />
            </VTooltip>
          </VSheet>
          {requestViewType.value === 0 ? ( //
            <RequestSequence v-model={current.value} />
          ) : (
            <RequestStructure v-model={current.value} v-model:expanded={expanded.value} />
          )}
        </VCard>

        <VCard class={['fill-height', 'overflow-auto', 'flex-grow-1', 'pa-3']}>
          <RequestDetails modelValue={current.value} />
        </VCard>
      </VContainer>
    )
  },
})
