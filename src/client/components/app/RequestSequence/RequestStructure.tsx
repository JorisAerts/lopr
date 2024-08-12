import type { PropType } from 'vue'
import { computed, defineComponent } from 'vue'
import { VList, VListItem } from '../../core'
import { useRequestStore } from '../../../stores/request'
import type { ProxyRequestInfo } from '../../../../shared/Request'
import type { UUID } from '../../../../shared/UUID'

const Tree = (struct: Record<string, unknown>, prefix = '', id = 0) =>
  struct ? (
    <VList>
      {struct.nodes &&
        Object.entries(struct.nodes).map(([key, value]) => {
          return (
            <>
              <VListItem
                class={['py-0', 'px-1', 'no-wrap', 'overflow-ellipsis']}
                style={{ 'margin-left': `${id * 10}px` }}
                prependIcon={value.nodes || value.items ? 'KeyboardArrowRight' : undefined}
              >
                {key}
              </VListItem>
              {Tree(value, prefix.length ? `${prefix}/${key}` : key, id + 1)}
            </>
          )
        })}

      {struct.items &&
        (struct.items as UUID[]).map((value) => {
          const request = useRequestStore().getRequest(value)
          return (
            request && (
              <VListItem class={['py-0', 'px-1', 'no-wrap', 'overflow-ellipsis']} style={{ 'margin-left': `${id * 10}px` }} prependIcon={'FiberManualRecord'}>
                {request.method} {request.url.substring(prefix.length + 1) || '/'}
              </VListItem>
            )
          )
        })}
    </VList>
  ) : null

export const RequestStructure = defineComponent({
  name: 'request-structure',

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    const structure = computed(() => {
      const struct: Record<string, unknown> = {}

      requestStore.ids.forEach((uuid) => {
        const request = requestStore.getRequest(uuid)
        if (!request) return

        const url = request.url
        const indexOf = url.indexOf('://')
        const parts = (indexOf > -1 ? url.substring(indexOf + 3) : url) //
          .split('/')

        if (indexOf > -1) parts[0] = (indexOf > -1 ? url.substring(0, indexOf + 3) : '') + parts[0]

        if (parts.length === 1) parts.push('/')

        let s: Record<string, unknown> | any = struct
        parts.forEach((p, i) => {
          if (i === parts.length - 1) {
            s.items ??= []
            s.items.push(uuid)
          } else {
            s.nodes ??= {}
            s.nodes[p] ??= {}
            s = s.nodes[p]
          }
        })
      })

      console.log({ struct })
      return struct
    })

    return () => <VList class={['fill-height', 'overflow-auto', 'mt-2']}>{Tree(structure.value)}</VList>
  },
})
