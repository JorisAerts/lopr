import './RequestStructure.scss'
import type { ComponentPublicInstance, PropType, VNode } from 'vue'
import { defineComponent, getCurrentInstance, onMounted, ref, watch, withModifiers } from 'vue'
import { VList, VListGroup, VListItem } from 'lopr-ui/components'
import { useRequestStore } from '../../stores/request'
import type { UUID } from 'lopr-shared'
import { Sorting } from 'lopr-shared'
import { makeUUIDEvents, makeUUIDProps } from '../../composables/uuid'
import { isOnScreen } from '../../utils/is-on-screen'

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

const getPath = (struct: StructNode, uuid: UUID) => {
  const children: string[] = struct.nodes
    ? Object.entries(struct.nodes) //
        .flatMap(([, value]) => getPath(value, uuid))
    : []

  if (children.length || struct.items?.includes(uuid)) children.push(struct.key)
  return children
}

export const RequestStructure = defineComponent({
  name: 'request-structure',

  emits: {
    ...makeUUIDEvents(),
    'update:expanded': (_: string[]) => true,
  },

  props: {
    ...makeUUIDProps(),
    filterText: { type: String },
    expanded: { type: Array as PropType<string[]>, default: [] as string[] },
    sorting: { type: Number as PropType<Sorting>, default: 0 },
  },

  setup(props, { emit }) {
    const list = ref<VNode & ComponentPublicInstance>()
    const requestStore = useRequestStore()
    const contains = (key: string) => props.expanded.includes(key)
    const handleFolding = (evt: Event | MouseEvent, key: string, value: StructNode) => {
      const sel = props.expanded
      emit(
        'update:expanded',
        (() => {
          if (contains(key)) return removeKey(sel, key)
          const result = new Set<string>([key])

          // auto-expand single item nodes
          // this avoids clicking open a lot of folders containing only one other folder
          let current = value
          while (current && (!current.items || current.items?.length === 0) && current.nodes && Object.keys(current.nodes).length === 1) {
            result.add(current.key)
            current = current.nodes[Object.keys(current.nodes)[0] as keyof typeof current.nodes]!
          }
          result.add(current.key)

          // add everything together now
          return sel.concat([...result])
        })()
      )
    }
    const handleSelect = (uuid: UUID) => {
      emit('update:modelValue', uuid)
    }
    watch(
      () => props.sorting,
      () => getCurrentInstance()?.proxy?.$forceUpdate()
    )
    // when the current selected item changes,
    // the selection tree should be unfolded so that this item becomes visible
    watch(
      () => requestStore.current,
      (current, oldValue) => {
        if (!current || current === oldValue) return
        const path = getPath(requestStore.structure, current)
        if (path.every((p) => props.expanded.includes(p))) return
        const ret = new Set<string>(props.expanded)
        path.forEach((p) => ret.add(p))
        emit('update:expanded', [...ret])
      },
      { immediate: true }
    )

    const getSortedStructKeys = (struct: StructNode) =>
      struct.nodes //
        ? props.sorting
          ? Object.keys(struct.nodes).toSorted(props.sorting === Sorting.Ascending ? (a, b) => a.localeCompare(b) : (a, b) => b.localeCompare(a))
          : Object.keys(struct.nodes)
        : []

    // recursively render the tree
    const renderTree = (struct: StructNode) => {
      if (!struct) return

      const items: UUID[] = struct.items ?? []
      const filteredItems = items //
        .map((uuid) => requestStore.getRequest(uuid))
        .filter((request) => !props.filterText || !request || request.url.indexOf(props.filterText) > -1)

      return (
        <>
          {struct.nodes &&
            getSortedStructKeys(struct).map((name) => {
              const value = struct.nodes![name]
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

          {filteredItems.map((request) => {
            const uuid = request!.uuid
            return (
              request && (
                <VListItem
                  key={uuid}
                  onClick={() => handleSelect(uuid)}
                  prependIcon={'Public'}
                  class={[
                    'py-0',
                    'no-wrap',
                    {
                      'v-list-item--new': requestStore.isNew(uuid),
                      selected: props.modelValue === uuid,
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
      )
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
      <VList class={['request-structure']} ref={list}>
        {renderTree(requestStore.structure)}
      </VList>
    )
  },
})
