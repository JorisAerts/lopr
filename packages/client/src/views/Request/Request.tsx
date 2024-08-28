import type { PropType, Ref } from 'vue'
import { computed, defineComponent, ref, Transition, watch } from 'vue'
import { VBtn, VCard, VContainer, VSheet, VSpacer } from 'js-proxy-ui'
import { useRequestStore } from '../../stores/request'
import type { UUID } from 'js-proxy-shared'
import { Sorting } from 'js-proxy-shared'
import { RequestDetails, RequestSequence, RequestStructure } from '../../components'

export const Request = defineComponent({
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

    watch(requestStore.ids, (newVal) => !newVal.length && (current.value = undefined))

    const sorting = ref(Sorting.None)

    return () => (
      <VContainer class={['fill-height', 'gap-2']}>
        <VCard
          class={['fill-height', 'py-2', 'd-flex', 'flex-column']}
          style={{
            width: width.value,
            'max-width': width.value,
          }}
        >
          <VSheet class={['d-flex', 'px-3', 'align-items-center']}>
            <h3>
              Requests <sup>({requestStore.ids.length})</sup>
            </h3>
            <Transition>
              {requestViewType.value !== 0 && (
                <VBtn
                  tooltip={sorting.value === Sorting.None ? 'Sort ascending' : sorting.value === Sorting.Ascending ? 'Sort descending' : `Turn off sorting`}
                  icon={'Sort'}
                  iconClass={{
                    'mirror-v': sorting.value === Sorting.Descending,
                  }}
                  size={20}
                  class={['pa-1', 'ml-2']}
                  transparent
                  selected={sorting.value !== 0}
                  disabled={requestViewType.value === 0}
                  onClick={() => (sorting.value === 1 ? (sorting.value = -1) : sorting.value++)}
                />
              )}
            </Transition>
            <VSpacer />
            <VBtn tooltip={'Sequence view'} icon={'Reorder'} size={20} class={['pa-1', 'mr-1']} transparent onClick={() => (requestViewType.value = 0)} />
            <VBtn tooltip={'Structure view'} icon={'AccountTree'} size={20} class={['pa-1']} transparent onClick={() => (requestViewType.value = 1)} />
          </VSheet>
          <VSheet class={['fill-height', 'overflow-auto', 'mt-2', 'px-2']}>
            {requestViewType.value === 0 ? ( //
              <RequestSequence v-model={current.value} />
            ) : (
              <RequestStructure v-model={current.value} v-model:expanded={expanded.value} sorting={sorting.value} />
            )}
          </VSheet>
        </VCard>

        <VCard class={['fill-height', 'overflow-auto', 'flex-grow-1', 'pa-3']}>
          <RequestDetails modelValue={current.value} />
        </VCard>
      </VContainer>
    )
  },
})
