import './Menu.scss'
import type { CSSProperties, Ref } from 'vue'
import { defineComponent, ref, Teleport, Transition, watch } from 'vue'
import { addDOMListener } from '../../../utils/addDOMListener'

const getRect = (el?: HTMLElement) => {
  const x = el?.offsetLeft ?? 0
  const y = el?.offsetTop ?? 0
  const width = el?.offsetWidth ?? 0
  const height = el?.offsetHeight ?? 0
  return { x, y, width, height, bottom: y + height, left: x, right: x + width, top: y }
}

export const VMenu = defineComponent({
  name: 'v-menu',

  emits: ['update:modelValue'],

  props: {
    closeOnContentClick: { type: Boolean, default: true },
    modelValue: { type: Boolean, default: false },

    contentTarget: { type: [String, Object], default: () => '.o-app' },
  },

  setup(props, { attrs, slots, emit, expose }) {
    const root: Ref<HTMLSpanElement | undefined> = ref()
    const content: Ref<HTMLSpanElement | undefined> = ref()
    const value = ref(props.modelValue)
    const activatorProps = {
      onClick: () => {
        value.value = !value.value
        emit('update:modelValue', value.value)
      },
    }

    const contentStyles = ref({} as CSSProperties)
    const listener = () => {
      const triggerRect = getRect(root.value)
      const contentRect = getRect(content.value)
      const windowRect = {
        width: window.innerWidth,
        height: window.innerHeight,
      }

      // if the menu will fall outside of the screen it will be shown above iso below the triggering component
      const vertical =
        windowRect.height - contentRect.height < triggerRect.bottom && triggerRect.top - contentRect.height > 0
          ? { bottom: `${windowRect.height - triggerRect.top}px` }
          : { top: `${triggerRect.bottom}px` }
      // if the menu will fall outside of the screen it will be attached to the right of the triggering component
      const horizontal =
        windowRect.width - contentRect.width < triggerRect.left && triggerRect.left + triggerRect.width - contentRect.width > 0
          ? { right: `${windowRect.width - (triggerRect.left + triggerRect.width)}px` }
          : { left: `${triggerRect.left}px` }

      contentStyles.value = { position: 'absolute', ...vertical, ...horizontal }
    }
    watch([root, content], listener)
    addDOMListener(window, 'resize', listener, { passive: true })

    watch(
      () => props.modelValue,
      () => {
        value.value = props.modelValue
      }
    )

    const hide = () => {
      value.value = false
      emit('update:modelValue', value.value)
    }

    addDOMListener(document, 'mousedown', (e: Event) => {
      if (e.target && (e.target === root.value || root.value?.contains(e.target as Node) || e.target === content.value || content.value?.contains(e.target as Node))) return
      e.preventDefault()
      hide()
    })

    expose({ hide })

    return () => (
      <div ref={root} class={'o-menu'} {...attrs}>
        {slots.activator && (
          <div class={['o-menu--activator']}>
            {slots.activator({
              props: {
                ...activatorProps,
                class: { selected: value.value },
              },
            })}
          </div>
        )}
        <Teleport to={props.contentTarget}>
          <Transition>
            {value.value && (
              <span ref={content} class={'o-menu--contents'} style={contentStyles.value} v-show={value.value} onClick={props.closeOnContentClick ? hide : undefined}>
                {slots.default?.({
                  left: contentStyles.value.left,
                  top: contentStyles.value.top,
                })}
              </span>
            )}
          </Transition>
        </Teleport>
      </div>
    )
  },
})
