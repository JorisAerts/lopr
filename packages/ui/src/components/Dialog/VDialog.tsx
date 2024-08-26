import './VDialog.scss'
import { defineComponent, onMounted, ref, Teleport, watch } from 'vue'
import { addDOMListener } from '../../utils'
import { VWindowOverlay } from '../WindowOverlay'

export interface VDialogActivatorEventHandlers {
  onClick<Args extends any[]>(...args: Args): any
}

export interface VDialogActivatorProps {
  props: VDialogActivatorEventHandlers
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

    const close = (e: Event) => {
      if (!props.clickOutsideToClose || (e.target && (e.target === dialog.value || dialog.value?.contains(e.target as Node)))) return
      e.preventDefault()
      emit('update:modelValue', (modelValue.value = false))
    }

    addDOMListener(document, 'mousedown', close)

    return () => (
      <>
        <>{slots.activator?.({ props: { onClick: activate } } as VDialogActivatorProps)}</>
        <>
          {modelValue.value === true && (
            <Teleport to={props.contentTarget}>
              <VWindowOverlay class={['v-dialog']} transparent={props.transparent} centered={props.centered} {...attrs} {...{ onClick: close }}>
                <section ref={dialog} class={['v-dialog--contents']}>
                  {slots.default?.()}
                </section>
              </VWindowOverlay>
            </Teleport>
          )}
        </>
      </>
    )
  },
})
