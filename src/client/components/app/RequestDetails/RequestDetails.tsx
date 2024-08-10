import type { PropType, Ref } from 'vue'
import { computed, defineComponent, ref, watch } from 'vue'
import { VTab, VTabItem, VTabItems, VTabs } from '../../core'
import type { ProxyRequestInfo } from '../../../../shared/Request'
import type { UUID } from '../../../../shared/UUID'
import { useRequestStore } from '../../../stores/request'
import { RequestOverviewTable } from './RequestOverviewTable'

const REQUEST_TAB_INDEX = 0
const RESPONSE_TAB_INDEX = 1

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
      { immediate: true }
    )
    const response = computed(() =>
      props.modelValue //
        ? requestStore.getResponse(props.modelValue.uuid)
        : undefined
    )
    const responseBody = computed(() => (props.modelValue ? response.value?.body : undefined))
    return () =>
      props.modelValue && (
        <div class={['d-flex', 'flex-column', 'fill-height']}>
          <VTabs v-model={currentTab.value} class={['mb-2', 'flex-grow-0']}>
            <VTab name={'Request'} modelValue={REQUEST_TAB_INDEX} />
            {response.value && <VTab name={'Response'} modelValue={RESPONSE_TAB_INDEX} />}
          </VTabs>

          <VTabItems modelValue={currentTab.value} class={['flex-grow-0', 'overflow-auto']}>
            <VTabItem modelValue={REQUEST_TAB_INDEX}>
              <RequestOverviewTable modelValue={props.modelValue} />
            </VTabItem>
            <VTabItem modelValue={RESPONSE_TAB_INDEX}>{responseBody.value && <pre class={['text-mono']}>{responseBody.value}</pre>}</VTabItem>
          </VTabItems>
        </div>
      )
  },
})
