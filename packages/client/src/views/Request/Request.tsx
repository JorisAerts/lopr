import type { PropType } from 'vue'
import { computed, defineComponent, ref, Transition, watch, watchEffect } from 'vue'
import { VBtn, VBtnGroup, VCard, VContainer, VInputField, VSheet, VSpacer } from 'lopr-ui'
import { useRequestStore } from '../../stores/request'
import type { UUID } from 'lopr-shared'
import { Sorting } from 'lopr-shared'
import { RequestDetails, RequestSequence, RequestStructure } from '../../components'
import { useRoute } from 'vue-router'
import { pushRoute, router } from '../../router'
import { RouteNames } from '../../router/RouteNames'

export const Request = defineComponent({
  name: 'requests-monitor',

  props: {
    width: { type: [Number, String] as PropType<number | string>, default: 320 },
  },

  setup(props) {
    const requestStore = useRequestStore()
    const route = useRoute()

    const requestFilter = ref<string>()

    watch(
      () => [route.params.uuid],
      () => {
        const uuid = route.params.uuid
        if (uuid && !Array.isArray(uuid)) {
          requestStore.current = uuid as UUID
        }
      },
      { immediate: true }
    )

    watchEffect(() => {
      if (!requestStore.current) return
      if (requestStore.initialized && !requestStore.isValidUUID(requestStore.current)) {
        requestStore.current = undefined
        return pushRoute({ name: RouteNames.Requests })
      }
      if (requestStore.current !== route.params.uuid) {
        return pushRoute({ name: RouteNames.RequestDetails, params: { uuid: requestStore.current } })
      }
    })

    const width = computed(() => (typeof props.width === 'number' ? `${props.width}px` : props.width))
    const requestViewType = ref(1)
    const expanded = ref<string[]>([])

    watch(requestStore.ids, (newVal) => {
      if (newVal.length) return
      router.push({ name: RouteNames.Requests })
      requestStore.current = undefined
    })

    const sorting = ref(Sorting.None)

    return () => (
      <VContainer class={['fill-height', 'gap-2']}>
        <VCard
          flat
          class={['fill-height', 'pt-2', 'd-flex', 'flex-column']}
          style={{
            width: width.value,
            'max-width': width.value,
            'min-width': width.value,
          }}
        >
          <VSheet class={['d-flex', 'px-3', 'align-items-center']}>
            <h3 class={['mb-0']}>
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
            <VBtnGroup v-model={requestViewType.value}>
              <VBtn tooltip={'Sequence view'} icon={'Reorder'} size={20} class={['pa-1', 'mr-1']} transparent onClick={() => (requestViewType.value = 0)} />
              <VBtn tooltip={'Structure view'} icon={'AccountTree'} size={20} class={['pa-1']} transparent onClick={() => (requestViewType.value = 1)} />
            </VBtnGroup>
          </VSheet>
          <VSheet class={['fill-height', 'overflow-auto', 'my-2', 'px-1']}>
            {requestViewType.value === 0 ? ( //
              <RequestSequence v-model={requestStore.current} filterText={requestFilter.value} />
            ) : (
              <RequestStructure v-model={requestStore.current} v-model:expanded={expanded.value} sorting={sorting.value} filterText={requestFilter.value} />
            )}
          </VSheet>
          <VSheet class={['flex-grow-0']}>
            <VInputField class={['py-0', 'px-1', 'ma-1']} placeholder={'Filter'} v-model={requestFilter.value} />
          </VSheet>
        </VCard>

        <VCard flat class={['fill-height', 'overflow-auto', 'flex-grow-1', 'pa-3']}>
          <RequestDetails modelValue={requestStore.current} />
        </VCard>
      </VContainer>
    )
  },
})
