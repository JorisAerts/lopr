import './RequestSequence.scss'
import type { ComponentPublicInstance, VNode } from 'vue'
import { defineComponent, onMounted, ref, watch } from 'vue'
import { VList, VListItem, VSheet } from 'js-proxy-ui/components'
import { useRequestStore } from '../../stores/request'
import type { ProxyRequestInfo } from 'js-proxy-shared'
import { makeUUIDEvents, makeUUIDProps } from '../../composables/uuid'

const isOnScreen = (
  //
  element: Element | undefined | null,
  { x = 0, y = 0, width = window.screenX, height = window.screenY } = { x: 0, y: 0, width: window.screenX, height: window.screenY },
  margin = 0
) => {
  const boundingBox = element?.getBoundingClientRect()
  return (
    boundingBox && //
    boundingBox.x + boundingBox.width > x + margin &&
    boundingBox.x < x + width - margin &&
    boundingBox.y + boundingBox.height > y + margin &&
    boundingBox.y < y + height - margin
  )
}

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
