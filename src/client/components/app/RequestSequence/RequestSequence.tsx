import type { ComponentPublicInstance, PropType, VNode } from 'vue'
import { defineComponent, onUpdated, ref, TransitionGroup } from 'vue'
import { VList, VListItem } from '../../core'
import { useRequestStore } from '../../../stores/request'
import type { ProxyRequestInfo } from '../../../../shared/Request'

export const RequestSequence = defineComponent({
  name: 'request-sequence',

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'update:modelValue': (_: ProxyRequestInfo) => true,
  },

  props: {
    modelValue: { type: Object as PropType<ProxyRequestInfo> },
  },

  setup(props, { emit }) {
    const list = ref<VNode & ComponentPublicInstance>()
    const requestStore = useRequestStore()
    const handleSelect = (item: ProxyRequestInfo) => {
      emit('update:modelValue', item)
    }
    onUpdated(() => {
      const el = list.value?.$el
      if (!el || !el.$el) return
      el.$el.lastChild.scrollIntoView()
    })
    return () => (
      <VList class={['fill-height', 'overflow-auto', 'mt-2']} ref={list}>
        <TransitionGroup>
          {requestStore.ids
            .map((uuid) => requestStore.getRequest(uuid))
            .map(
              (req) =>
                req && (
                  <VListItem
                    key={req.uuid}
                    onClick={() => handleSelect(req)}
                    class={[
                      'py-0',
                      'mx-1',
                      'px-1',
                      'overflow-ellipsis',
                      {
                        selected: props.modelValue === req,
                      },
                    ]}
                    prependIcon={'InputCircle'}
                  >
                    <div class={['no-wrap', 'overflow-hidden', 'overflow-ellipsis']}>
                      {req.method} — {req.url}
                    </div>
                  </VListItem>
                )
            )}
        </TransitionGroup>
      </VList>
    )
  },
})
