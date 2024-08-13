import type { ComponentPublicInstance, VNode } from 'vue'
import { defineComponent, ref, TransitionGroup, watch } from 'vue'
import { VList, VListItem } from '../../core'
import { useRequestStore } from '../../../stores/request'
import type { ProxyRequestInfo } from '../../../../shared/Request'
import { makeUUIDEvents, makeUUIDProps } from '../../../composables/uuid'

export const RequestSequence = defineComponent({
  name: 'request-sequence',

  emits: {
    ...makeUUIDEvents(),
  },

  props: {
    ...makeUUIDProps(),
  },

  setup(props, { emit }) {
    const list = ref<VNode & ComponentPublicInstance>()
    const requestStore = useRequestStore()
    const handleSelect = (item: ProxyRequestInfo) => {
      emit('update:modelValue', item.uuid)
    }
    watch(requestStore.ids, () => {
      if (!props.modelValue) list.value?.$el?.lastElementChild?.scrollIntoView()
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
                    prependIcon={'Public'}
                    class={[
                      'py-0',
                      'mx-1',
                      'overflow-ellipsis',
                      {
                        selected: props.modelValue === req.uuid,
                      },
                    ]}
                  >
                    <div class={['no-wrap', 'overflow-hidden', 'overflow-ellipsis']} title={`${req.method} — ${req.url}`}>
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
