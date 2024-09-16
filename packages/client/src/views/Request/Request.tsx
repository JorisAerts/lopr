import type { PropType } from 'vue'
import { computed, defineComponent, ref, Transition, watch, watchEffect } from 'vue'
import { VBadge, VBtn, VBtnGroup, VCard, VContainer, VInputField, VSheet, VSpacer } from 'lopr-ui'
import { useCache } from '../../stores/cache'
import { Sorting } from 'lopr-shared'
import { RequestDetails, RequestSequence, RequestStructure } from '../../components'
import { useRoute } from 'vue-router'
import { pushRoute, router } from '../../router'
import { RouteNames } from '../../router/RouteNames'
import { useRequestStore } from '../../stores/request'
import { formatNumber } from '../../utils/numberUtils'

export const Request = defineComponent({
  name: 'requests-monitor',

  props: {
    width: { type: [Number, String] as PropType<number | string>, default: 320 },
  },

  setup(props) {
    const cache = useCache()
    const requestStore = useRequestStore()
    const route = useRoute()

    watchEffect(() => {
      if (!cache.current) return
      if (cache.initialized && !cache.isValidUUID(cache.current)) {
        cache.current = undefined
        return pushRoute({ name: RouteNames.Requests })
      }
      if (cache.current !== route.params.uuid) {
        return pushRoute({ name: RouteNames.RequestDetails, params: { uuid: cache.current }, query: route.query })
      }
    })

    const width = computed(() => (typeof props.width === 'number' ? `${props.width}px` : props.width))
    const requestViewType = ref(1)
    const expanded = ref<string[]>([])

    watch(cache.ids, (newVal) => {
      if (newVal.length) return
      router.push({ name: RouteNames.Requests })
      cache.current = undefined
    })

    let timeout = -1
    watch(
      () => requestStore.filter,
      () => {
        window.clearTimeout(timeout)
        timeout = window.setTimeout(() => pushRoute({ ...route, query: { ...route.query, q: requestStore.filter || undefined } }), 33)
      }
    )

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
              Requests <VBadge modelValue={formatNumber(cache.ids.length)} color={'--primary-color'} style={{ color: 'rgb(var(--on-primary-color))' }} />
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
              <RequestSequence v-model={cache.current} filterText={requestStore.filter} />
            ) : (
              <RequestStructure v-model={cache.current} v-model:expanded={expanded.value} sorting={sorting.value} filterText={requestStore.filter} />
            )}
          </VSheet>
          <VSheet class={['flex-grow-0']}>
            <VInputField class={['py-0', 'px-1', 'ma-1']} placeholder={'Filter'} v-model={requestStore.filter} />
          </VSheet>
        </VCard>

        <VCard flat class={['fill-height', 'overflow-auto', 'flex-grow-1', 'pa-3']}>
          <RequestDetails modelValue={cache.current} />
        </VCard>
      </VContainer>
    )
  },
})
