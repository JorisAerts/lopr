import './VDialog.scss'
import { defineComponent, onMounted, provide, ref, Teleport, Transition, watch } from 'vue'
import { addDOMListenerOnMounted } from '../../utils'
import { VWindowOverlay } from '../WindowOverlay'
import { DIALOG_CLOSE_SYMBOL } from './dialog'

export interface VDialogActivatorEventHandlers {
  onClick<Args extends any[]>(...args: Args): any
}

export interface VDialogActivatorProps {
  props: VDialogActivatorEventHandlers
}

export interface VDialogDefaultProps {
  close: (...args: any[]) => any
}

export const VDialog = defineComponent({
  name: 'v-dialog',

  emits: ['update:modelValue'],

  props: {
    modelValue: { type: Boolean, default: false },
    transparent: { type: Boolean, default: false },
    centered: { type: Boolean, default: true },
    contentTarget: { type: [String, Object], default: () => 'body' },

    clickOutsideToClose: { type: Boolean, default: false },
    escapeToClose: { type: Boolean, default: false },
  },

  setup(props, { slots, attrs, emit }) {
    const dialog = ref()
    const modelValue = ref(false)
    watch(
      () => props.modelValue,
      () => (modelValue.value = props.modelValue)
    )
    // wait after mount to make sure the App is loaded
    onMounted(() => (modelValue.value = props.modelValue))

    const activate = () => {
      modelValue.value = true
      emit('update:modelValue', modelValue.value)
    }

    const internalClose = () => emit('update:modelValue', (modelValue.value = false))

    const close = (e: Event) => {
      if (!modelValue.value || !props.clickOutsideToClose || (e.target && (e.target === dialog.value || dialog.value?.contains(e.target as Node)))) return
      internalClose()
    }

    addDOMListenerOnMounted(document, 'keydown', (e: KeyboardEvent) => {
      if (props.escapeToClose && e.key === 'Escape') {
        internalClose()
      }
    })

    addDOMListenerOnMounted(document, 'mousedown', close)

    provide(DIALOG_CLOSE_SYMBOL, internalClose)

    return () => (
      <>
        <>{slots.activator?.({ props: { onClick: activate } } as VDialogActivatorProps)}</>
        <>
          <Teleport to={props.contentTarget}>
            <Transition>
              {modelValue.value === true && (
                <VWindowOverlay class={['v-dialog']} transparent={props.transparent} centered={props.centered} {...attrs} {...{ onClick: close }}>
                  <section ref={dialog} class={['v-dialog--contents']}>
                    {slots.default?.({ close: internalClose } as VDialogDefaultProps)}
                  </section>
                </VWindowOverlay>
              )}
            </Transition>
          </Teleport>
        </>
      </>
    )
  },
})
