import type { PropType, Ref } from 'vue'
import { computed, defineComponent, ref, watch } from 'vue'
import { VTab, VTabItem, VTabItems, VTabs } from '../../core'
import type { ProxyRequestInfo } from '../../../../shared/Request'
import type { UUID } from '../../../../shared/UUID'
import { useRequestStore } from '../../../stores/request'
import { RequestOverviewTable } from './RequestOverviewTable'
import { HeadersTable } from './HeadersTable'
import { ResponseBody } from './ResponseBody'

const REQUEST_TAB_INDEX = 0
const REQUEST_HEADERS_INDEX = 1
const RESPONSE_BODY_TAB_INDEX = 2
const RESPONSE_HEADERS_TAB_INDEX = 3

export const RequestDetails = defineComponent({
  name: 'RequestDetails',

  props: {
    modelValue: { type: Object as PropType<ProxyRequestInfo> },
  },

  setup(props) {
    const currentTab = ref(0)
    const uuid: Ref<UUID | undefined> = ref()
    const requestStore = useRequestStore()
    watch(
      props,
      (newValue) => {
        if (uuid.value !== newValue.modelValue?.uuid) currentTab.value = 0
        uuid.value = newValue.modelValue?.uuid
      },
      { immediate: true },
    )
    const response = computed(() =>
      props.modelValue //
        ? requestStore.getResponse(props.modelValue.uuid)
        : undefined,
    )
    return () =>
      props.modelValue && (
        <div class={['d-flex', 'flex-column', 'fill-height']}>
          <VTabs v-model={currentTab.value} class={['mb-2', 'flex-grow-0']}>
            <VTab name={'Overview'} modelValue={REQUEST_TAB_INDEX} />
            <VTab name={'Request Headers'} modelValue={REQUEST_HEADERS_INDEX} />
            {response.value && (
              <>
                <VTab name={'Response Headers'} modelValue={RESPONSE_HEADERS_TAB_INDEX} />
                <VTab name={'Response Body'} modelValue={RESPONSE_BODY_TAB_INDEX} />
              </>
            )}
          </VTabs>

          <VTabItems modelValue={currentTab.value} class={['flex-grow-0', 'overflow-auto', 'fill-height']}>
            <VTabItem modelValue={REQUEST_TAB_INDEX}>
              <RequestOverviewTable modelValue={props.modelValue} />
            </VTabItem>
            <VTabItem modelValue={REQUEST_HEADERS_INDEX}>
              <HeadersTable modelValue={props.modelValue.headers} />
            </VTabItem>
            {!!response.value?.headers?.length && (
              <VTabItem modelValue={RESPONSE_HEADERS_TAB_INDEX}>
                <HeadersTable modelValue={response.value?.headers} />
              </VTabItem>
            )}
            <VTabItem modelValue={RESPONSE_BODY_TAB_INDEX} class={['fill-height']}>
              <ResponseBody modelValue={uuid.value} />
            </VTabItem>
          </VTabItems>
        </div>
      )
  },
})
