import { defineComponent, reactive, ref, watch } from 'vue'
import { VTab, VTabItem, VTabItems, VTabs } from '../../ui'
import type { UUID } from '../../../../shared/UUID'
import { RequestOverviewTable } from './RequestOverviewTable'
import { HeadersTable } from './HeadersTable'
import { ResponseBody } from './ResponseBody'
import { CookiesTable } from './CookiesTable'
import { makeUUIDProps, useUUID } from '../../../composables/uuid'
import { useRequest } from '../../../composables/request'
import { useResponse } from '../../../composables/response'

const REQUEST_TAB_INDEX = 0
const REQUEST_HEADERS_INDEX = 1
const REQUEST_COOKIES_INDEX = 2
const RESPONSE_HEADERS_TAB_INDEX = 3
const RESPONSE_BODY_TAB_INDEX = 4

type Tab =
  | typeof REQUEST_TAB_INDEX
  | typeof REQUEST_HEADERS_INDEX
  | typeof REQUEST_COOKIES_INDEX
  | typeof RESPONSE_HEADERS_TAB_INDEX
  | typeof RESPONSE_BODY_TAB_INDEX

export const RequestDetails = defineComponent({
  name: 'RequestDetails',

  props: {
    ...makeUUIDProps(),
  },

  setup(props) {
    const currentTab = ref<Tab>(0)
    const uuid = useUUID(props)
    const request = reactive(useRequest(uuid))
    const response = reactive(useResponse(uuid))
    const canDisplayTab = (uuid: UUID | undefined, tab: Tab) => {
      const refUUID = ref(uuid)
      const request = reactive(useRequest(refUUID))
      const response = reactive(useResponse(refUUID))
      switch (tab) {
        case REQUEST_HEADERS_INDEX:
          return request.hasHeaders
        case REQUEST_COOKIES_INDEX:
          return request.hasCookies
        case RESPONSE_HEADERS_TAB_INDEX:
          return response.hasHeaders
        case RESPONSE_BODY_TAB_INDEX:
          return response.hasBody
        default:
          return true
      }
    }
    watch(
      uuid,
      (newValue) => {
        if (0 != currentTab.value && !canDisplayTab(newValue, currentTab.value)) currentTab.value = 0
      },
      { immediate: true },
    )
    return () =>
      uuid.value && (
        <div class={['d-flex', 'flex-column', 'fill-height']}>
          <VTabs v-model={currentTab.value} class={['mb-2', 'flex-grow-0']}>
            <VTab name={'Overview'} modelValue={REQUEST_TAB_INDEX} />
            <VTab name={'Request Headers'} modelValue={REQUEST_HEADERS_INDEX} />
            {request.hasCookies && <VTab name={'Request Cookies'} modelValue={REQUEST_COOKIES_INDEX} />}
            {response && (
              <>
                <VTab name={'Response Headers'} modelValue={RESPONSE_HEADERS_TAB_INDEX} />
                <VTab name={'Response Body'} modelValue={RESPONSE_BODY_TAB_INDEX} />
              </>
            )}
          </VTabs>

          <VTabItems modelValue={currentTab.value} class={['flex-grow-0', 'overflow-auto', 'fill-height']}>
            <VTabItem modelValue={REQUEST_TAB_INDEX}>
              <RequestOverviewTable modelValue={uuid.value} />
            </VTabItem>
            <VTabItem modelValue={REQUEST_HEADERS_INDEX}>
              <HeadersTable modelValue={request.headersRaw} />
            </VTabItem>
            {request.hasCookies && (
              <VTabItem modelValue={REQUEST_COOKIES_INDEX}>
                <CookiesTable modelValue={uuid.value} />
              </VTabItem>
            )}
            {response.hasHeaders && (
              <VTabItem modelValue={RESPONSE_HEADERS_TAB_INDEX}>
                <HeadersTable modelValue={response.headersRaw} />
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
