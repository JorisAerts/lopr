import './RequestSequence.scss'
import type { ComponentPublicInstance, VNode } from 'vue'
import { defineComponent, onMounted, ref, watch, withModifiers } from 'vue'
import { VHighlight, VList, VListItem, VSheet } from 'lopr-ui/components'
import { useCache } from '../../stores/cache'
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
    const cache = useCache()
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

    watch(cache.ids, scrollIntoView)
    onMounted(scrollIntoView)

    return () => (
      <VList class={['v-request-sequence']} ref={list}>
        {cache.ids
          .map((uuid) => cache.getRequest(uuid))
          .filter((req) => !props.filterText || (req && req.url.indexOf(props.filterText) > -1))
          .map((req) => {
            if (!req) return
            const text = `${req.method} — ${req.url}`
            const highlighted = props.filterText ? ( //
              <VHighlight text={text} highlight={props.filterText} />
            ) : (
              text
            )
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
                {{
                  default: () => (
                    <VSheet class={['v-request-sequence--item', 'no-wrap', 'overflow-ellipsis']}>
                      <a class={['hidden-link']} href={req.url} onClick={withModifiers(() => {}, ['prevent'])}>
                        {highlighted}
                      </a>
                    </VSheet>
                  ),
                }}
              </VListItem>
            )
          })}
      </VList>
    )
  },
})
