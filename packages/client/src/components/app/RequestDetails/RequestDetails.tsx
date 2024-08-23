import type { Tab } from './request-detail-tabs'
import { useRequestDetailTabs } from './request-detail-tabs'
import { defineComponent, reactive, ref, watch } from 'vue'
import { VTab, VTabItem, VTabItems, VTabs } from '../../ui'
import { RequestOverviewTable } from './RequestOverviewTable'
import { HeadersTable } from './HeadersTable'
import { ResponseBody } from './ResponseBody'
import { CookiesTable } from './CookiesTable'
import { makeUUIDProps, useUUID } from '../../../composables/uuid'
import { useRequest } from '../../../composables/request'
import { useResponse } from '../../../composables/response'
import { HTTP_HEADER_COOKIE } from '../../../../../shared/src/constants'

const REQUEST_TAB_INDEX = 0
const REQUEST_HEADERS_INDEX = 1
const RESPONSE_HEADERS_TAB_INDEX = 2
const RESPONSE_BODY_TAB_INDEX = 3

export const RequestDetails = defineComponent({
  name: 'RequestDetails',

  props: {
    ...makeUUIDProps(),
  },

  setup(props) {
    const currentTab = ref<Tab>(0)
    const uuid = useUUID(props)
    const requestTabs = useRequestDetailTabs(uuid)
    const request = reactive(useRequest(uuid))
    const response = reactive(useResponse(uuid))
    watch(
      uuid,
      (newValue) => {
        if (0 != currentTab.value && !requestTabs.canDisplayTab(newValue, currentTab.value)) currentTab.value = 0
      },
      { immediate: true }
    )
    const renderPanel = (id: number) =>
      id === REQUEST_TAB_INDEX ? (
        <RequestOverviewTable modelValue={uuid.value} />
      ) : id === REQUEST_HEADERS_INDEX ? (
        <HeadersTable modelValue={request.headersRaw}>
          {{
            [`header:${HTTP_HEADER_COOKIE}`]: () => <CookiesTable modelValue={uuid.value} />,
          }}
        </HeadersTable>
      ) : id === RESPONSE_HEADERS_TAB_INDEX ? (
        <HeadersTable modelValue={response.headersRaw} />
      ) : id === RESPONSE_BODY_TAB_INDEX ? (
        <ResponseBody modelValue={uuid.value} />
      ) : null

    return () =>
      uuid.value && (
        <div class={['d-flex', 'flex-column', 'fill-height']}>
          <VTabs v-model={currentTab.value} class={['mb-2', 'flex-grow-0']}>
            {requestTabs.map(([name, id, canDisplayTab]) => canDisplayTab && <VTab modelValue={id} name={name} />)}
          </VTabs>
          <VTabItems modelValue={currentTab.value} class={['flex-grow-0', 'overflow-auto', 'fill-height']}>
            {requestTabs.map(
              ([, id, canDisplayTab]) =>
                canDisplayTab && (
                  <VTabItem modelValue={id} class={'fill-height'}>
                    {renderPanel(id)}
                  </VTabItem>
                )
            )}
          </VTabItems>
        </div>
      )
  },
})
