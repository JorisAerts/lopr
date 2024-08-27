import './RequestStructure.scss'
import type { PropType } from 'vue'
import { defineComponent, withModifiers } from 'vue'
import { VList, VListGroup, VListItem } from 'js-proxy-ui/components'
import { useRequestStore } from '../../stores/request'
import type { UUID } from 'js-proxy-shared/UUID'
import { makeUUIDEvents, makeUUIDProps } from '../../composables/uuid'

const removeKey = (arr: string[], key: string) => {
  const pos = arr.indexOf(key)
  return pos > -1 ? arr.toSpliced(pos, 1) : [...arr]
}

interface StructNode {
  key: string
  isNew: boolean
  nodes?: { [Name: string]: StructNode }
  items?: UUID[]
}

export const RequestStructure = defineComponent({
  name: 'request-structure',

  emits: {
    ...makeUUIDEvents(),
    'update:expanded': (_: string[]) => true,
  },

  props: {
    ...makeUUIDProps(),
    expanded: { type: Array as PropType<string[]>, default: [] as string[] },
  },

  setup(props, { emit }) {
    const requestStore = useRequestStore()
    const contains = (key: string) => props.expanded.includes(key)
    const handleFolding = (evt: Event | MouseEvent, key: string, value: StructNode) => {
      const sel = props.expanded
      emit(
        'update:expanded',
        (() => {
          //if (('metaKey' in evt && evt.metaKey) || ('ctrlKey' in evt && evt.ctrlKey)) {
          //if (props.expanded.length) return []
          //return Object.keys(requestStore.structure.nodes ?? {})
          //}

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
        <>
          {struct.nodes &&
            Object.entries(struct.nodes).map(([name, value]) => {
              const key = value.key
              const hasItems = !!value.items || !!value.nodes
              const isOpen = contains(key)
              const onClick = (evt: Event) => (hasItems ? handleFolding(evt, key, value) : undefined)
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
                      'v-list-group--new': requestStore.isNew(key),
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
                      {
                        'v-list-item--new': requestStore.isNew(value),
                        selected: props.modelValue === value,
                      },
                    ]}
                    tooltip={`${request.method} ${request.url}`}
                  >
                    <span class={'overflow-ellipsis'}>
                      {request.method} {request.url.substring(struct.key?.length + 1) || '/'}
                    </span>
                  </VListItem>
                )
              )
            })}
        </>
      ) : null

    return () => <VList class={['request-structure']}>{renderTree(requestStore.structure)}</VList>
  },
})
