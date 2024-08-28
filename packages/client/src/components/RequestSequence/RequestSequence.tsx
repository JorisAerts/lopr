import './RequestSequence.scss'
import type { ComponentPublicInstance, VNode } from 'vue'
import { defineComponent, ref, watch } from 'vue'
import { VList, VListItem, VSheet } from 'js-proxy-ui/components'
import { useRequestStore } from '../../stores/request'
import type { ProxyRequestInfo } from 'js-proxy-shared'
import { makeUUIDEvents, makeUUIDProps } from '../../composables/uuid'

export const RequestSequence = defineComponent({
  name: 'request-sequence',

  emits: {
    ...makeUUIDEvents(),
  },

  props: {
    ...makeUUIDProps(),
  },

  setup(props, { emit }) {
    const requestStore = useRequestStore()
    const list = ref<VNode & ComponentPublicInstance>()
    const handleSelect = (item: ProxyRequestInfo) => {
      emit('update:modelValue', item.uuid)
    }
    watch(requestStore.ids, () => {
      if (!props.modelValue) list.value?.$el?.lastElementChild?.scrollIntoView()
    })

    return () => (
      <VList class={['v-request-sequence']} ref={list}>
        {requestStore.ids
          .map((uuid) => {
            return requestStore.getRequest(uuid)
          })
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
                    //'overflow-ellipsis',
                    {
                      selected: props.modelValue === req.uuid,
                    },
                  ]}
                  tooltip={`${req.method} — ${req.url}`}
                >
                  <VSheet class={['v-request-sequence--item', 'no-wrap', 'overflow-ellipsis']}>
                    {req.method} — {req.url}
                  </VSheet>
                </VListItem>
              )
          )}
      </VList>
    )
  },
})
