import './RequestStructure.scss'
import type { PropType } from 'vue'
import { computed, defineComponent, TransitionGroup, withModifiers } from 'vue'
import { VList, VListGroup, VListItem } from '../../core'
import { useRequestStore } from '../../../stores/request'
import type { UUID } from '../../../../shared/UUID'
import { makeUUIDEvents, makeUUIDProps } from '../../../composables/uuid'

const removeKey = (arr: string[], key: string) => {
  const result = [...arr]
  const pos = result.indexOf(key)
  if (pos > -1) {
    result.splice(pos, 1)
  }
  return result
}

interface StructNode {
  key: string
  nodes?: { [Name: string]: StructNode }
  items?: UUID[]
}

export const RequestStructure = defineComponent({
  name: 'request-structure',

  emits: {
    ...makeUUIDEvents(),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'update:expanded': (_: string[]) => true,
  },

  props: {
    ...makeUUIDProps(),
    expanded: { type: Array as PropType<string[]>, default: [] as string[] },
  },

  setup(props, { emit }) {
    const requestStore = useRequestStore()
    const contains = (key: string) => props.expanded.includes(key)
    const handleFolding = (key: string, value: StructNode) => {
      const sel = props.expanded
      emit(
        'update:expanded',
        (() => {
          if (contains(key)) return removeKey(sel, key)
          const result = new Set<string>([key])
          // auto-expand single item nodes
          let current = value
          while (current && (!current.items || current.items?.length === 0) && current.nodes && Object.keys(current.nodes).length === 1) {
            result.add(current.key)
            current = current.nodes[Object.keys(current.nodes)[0] as keyof typeof current.nodes]!
          }
          result.add(current.key)
          return sel.concat([...result])
        })()
      )
    }
    const handleSelect = (uuid: UUID) => {
      emit('update:modelValue', uuid)
    }
    // recursively render the tree
    const renderTree = (struct: StructNode) =>
      struct ? (
        <TransitionGroup>
          {struct.nodes &&
            Object.entries(struct.nodes).map(([name, value]) => {
              const key = value.key
              const hasItems = !!value.items || !!value.nodes
              const isOpen = contains(key)
              const onClick = () => (hasItems ? handleFolding(key, value) : undefined)
              const item = () => (
                <VListItem key={key} class={['py-0', 'no-wrap', 'overflow-ellipsis']} onClick={withModifiers(onClick, ['prevent'])} prependIcon={hasItems ? 'KeyboardArrowRight' : undefined}>
                  {name}
                </VListItem>
              )
              return hasItems ? (
                <VListGroup
                  key={`group:${key}`}
                  class={[
                    'request-structure-group',
                    {
                      'request-structure-group--open': isOpen,
                    },
                  ]}
                >
                  {{
                    activator: item,
                    default: () => (isOpen ? renderTree(value) : null),
                  }}
                </VListGroup>
              ) : (
                item()
              )
            })}

          {struct.items &&
            (struct.items as UUID[]).map((value) => {
              const request = requestStore.getRequest(value)
              return (
                request && (
                  <VListItem
                    key={value}
                    onClick={() => handleSelect(value)}
                    prependIcon={'Public'}
                    class={[
                      'py-0',
                      'no-wrap',
                      'overflow-ellipsis',
                      {
                        'v-list-item--new': requestStore.isNew(value),
                        selected: props.modelValue === value,
                      },
                    ]}
                  >
                    {request.method} {request.url.substring(struct.key.length + 1) || '/'}
                  </VListItem>
                )
              )
            })}
        </TransitionGroup>
      ) : null

    const structure = computed(() => {
      const struct: StructNode = { key: '' }
      requestStore.ids.forEach((uuid) => {
        const request = requestStore.getRequest(uuid)
        if (!request) return

        const url = request.url
        const indexOf = url.indexOf('://')
        const parts = (indexOf > -1 ? url.substring(indexOf + 3) : url) //
          .split('/')

        if (indexOf > -1) parts[0] = (indexOf > -1 ? url.substring(0, indexOf + 3) : '') + parts[0]
        if (parts.length === 1) parts.push('/')

        let current: StructNode = struct
        parts.reduce((key, p, i) => {
          current.key = key
          if (i === parts.length - 1) {
            current.items ??= []
            current.items.push(uuid)
          } else {
            current.nodes ??= {}
            current.nodes[p] ??= Object.create(null)
            current = current.nodes[p]
          }
          return `${key}${key ? '/' : ''}${p}`
        }, '')
      })
      return struct
    })

    return () => <VList class={['request-structure', 'fill-height', 'overflow-auto', 'mt-2']}>{renderTree(structure.value)}</VList>
  },
})
