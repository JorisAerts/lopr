import type { UseRequest } from '../../composables/request'
import { useRequest } from '../../composables/request'
import type { UseResponse } from '../../composables/response'
import { useResponse } from '../../composables/response'
import type { Ref } from 'vue'
import { isRef, ref } from 'vue'
import type { UUID } from 'js-proxy-shared'

const REQUEST_TAB_INDEX = 0
const REQUEST_HEADERS_INDEX = 1
const RESPONSE_HEADERS_TAB_INDEX = 2
const RESPONSE_BODY_TAB_INDEX = 3

const TABS = Object.freeze([
  ['Overview', (request: UseRequest) => !!request.request.value] as const,
  ['Request Headers', (request: UseRequest) => request.hasHeaders.value] as const,
  ['Response Headers', (response: UseResponse) => response.hasHeaders.value] as const,
  ['Response Body', (response: UseResponse) => response.hasBody.value] as const,
] as const)

export type Tab = typeof REQUEST_TAB_INDEX | typeof REQUEST_HEADERS_INDEX | typeof RESPONSE_HEADERS_TAB_INDEX | typeof RESPONSE_BODY_TAB_INDEX

const canDisplayTabByReqRes = (req: UseRequest, res: UseResponse, tab: Tab): boolean => {
  switch (tab) {
    // request
    case REQUEST_HEADERS_INDEX:
      return TABS[tab][1](req)
    // response
    case RESPONSE_HEADERS_TAB_INDEX:
    case RESPONSE_BODY_TAB_INDEX:
      return TABS[tab][1](res)
    // always, or just what's left (that we forgot)
    case REQUEST_TAB_INDEX:
    default:
      return true
  }
}
const canDisplayTabByRef = (uuid: Ref<UUID | undefined>, tab: Tab) => canDisplayTabByReqRes(useRequest(uuid), useResponse(uuid), tab)
export const canDisplayTab = (uuid: UUID | undefined | Ref<UUID | undefined>, tab: Tab): boolean => canDisplayTabByRef(isRef(uuid) ? uuid : ref(uuid), tab)

export const useRequestDetailTabs = (uuid: Ref<UUID | undefined>) => {
  const names = TABS.map(([name]) => name)
  const request = useRequest(uuid)
  const response = useResponse(uuid)
  const ids = TABS.map((_, i) => i)
  /**
   * Map [Tab Name, Tab Id, Can Display tab]
   * @param fn
   */
  const map = <T>(fn: (arg: [string, number, boolean], index?: number, arr?: readonly unknown[]) => T): T[] =>
    TABS.map((item, index) => fn([item[0], index, canDisplayTabByReqRes(request, response, index as Tab)], index, TABS))
  return { names, ids, map, canDisplayTab }
}
