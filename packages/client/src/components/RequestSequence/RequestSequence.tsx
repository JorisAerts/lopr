import './RequestSequence.scss'
import type { ComponentPublicInstance, VNode } from 'vue'
import { defineComponent, onMounted, ref, watch } from 'vue'
import { VList, VListItem, VSheet } from 'lopr-ui/components'
import { useRequestStore } from '../../stores/request'
import type { ProxyRequestInfo } from 'lopr-shared'
import { makeUUIDEvents, makeUUIDProps } from '../../composables/uuid'
import { isOnScreen } from '../../utils/is-on-screen'

export const RequestSequence = defineComponent({
  name: 'request-sequence',

  emits: {
    ...makeUUIDEvents(),
  },

  props: {
    ...makeUUIDProps(),
    filterText: { type: String },
  },

  setup(props, { emit }) {
    const requestStore = useRequestStore()
    const list = ref<VNode & ComponentPublicInstance>()
    const handleSelect = (item: ProxyRequestInfo) => {
      emit('update:modelValue', item.uuid)
    }
    const scrollIntoView = () => {
      const listEl: Element = list.value?.$el
      if (!listEl) return
      if (!props.modelValue) listEl.lastElementChild?.scrollIntoView()
      else {
        const selected: Element | null = listEl.querySelector('.selected')
        if (isOnScreen(selected, listEl.parentElement?.getBoundingClientRect())) return
        selected?.scrollIntoView(false)
      }
    }

    watch(requestStore.ids, scrollIntoView)
    onMounted(scrollIntoView)

    return () => (
      <VList class={['v-request-sequence']} ref={list}>
        {requestStore.ids
          .map((uuid) => requestStore.getRequest(uuid))
          .filter((req) => !props.filterText || (req && req.url.indexOf(props.filterText) > -1))
          .map((req) => {
            if (!req) return
            const text = `${req.method} — ${req.url}`
            return (
              <VListItem
                key={req.uuid}
                onClick={() => handleSelect(req)}
                prependIcon={'Public'}
                class={[
                  'py-0',
                  {
                    selected: props.modelValue === req.uuid,
                  },
                ]}
                tooltip={text}
              >
                <VSheet class={['v-request-sequence--item', 'no-wrap', 'overflow-ellipsis']}>{text}</VSheet>
              </VListItem>
            )
          })}
      </VList>
    )
  },
})
