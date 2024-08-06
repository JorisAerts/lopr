import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import { VList, VListItem } from '../../core'
import { useRequestStore } from '../../../stores/request'
import type { ProxyRequestInfo } from '../../../../shared/Request'

export const RequestStructure = defineComponent({
  name: 'request-structure',

  emits: {
    'update:modelValue': (_: ProxyRequestInfo) => true,
  },

  props: {
    modelValue: { type: Object as PropType<ProxyRequestInfo> },
  },

  setup(props, { emit }) {
    const requestStore = useRequestStore()
    const handleSelect = (item: ProxyRequestInfo) => {
      emit('update:modelValue', item)
    }
    return () => (
      <VList class={['fill-height', 'overflow-auto', 'mt-2']}>
        {requestStore.requests.map((req) => (
          <VListItem
            key={req.uuid}
            onClick={() => handleSelect(req)}
            class={[
              'py-0',
              'mx-1',
              'px-1',
              'overflow-ellipsis',
              { selected: props.modelValue === req },
            ]}
            prependIcon={'InputCircle'}
          >
            <div class={['no-wrap', 'overflow-hidden', 'overflow-ellipsis']}>
              {req.method} — {req.url}
            </div>
          </VListItem>
        ))}
      </VList>
    )
  },
})