import { computed, defineComponent, ref, Transition } from 'vue'
import './VTooltip.scss'

export const VTooltip = defineComponent({
  name: 'v-tooltip',

  props: {
    text: { type: String },
    delay: { type: Number, default: 250 },
    margin: { type: Number, default: 5 },
  },

  setup(props, { slots }) {
    const root = ref<HTMLDivElement>()
    const dlg = ref<HTMLDialogElement>()
    const show = ref(false)
    let timer: ReturnType<typeof setTimeout> | undefined
    const enter = () =>
      (timer = setTimeout(() => (show.value = true), props.delay))

    const leave = () => {
      clearTimeout(timer)
      show.value = false
    }
    const style = computed(() =>
      root.value
        ? {
            top: `${
              (root.value?.offsetTop ?? 0) -
              (dlg.value?.offsetHeight ?? 0) -
              props.margin
            }px`,
            left: `${root.value?.offsetLeft}px`,
          }
        : {
            display: 'none',
          }
    )
    const tooltip = computed(() => slots.tooltip?.() ?? props.text)
    return () =>
      tooltip.value ? (
        <div
          class={'v-tooltip'}
          onMouseenter={enter}
          onMouseleave={leave}
          ref={root}
        >
          <Transition>
            {show.value && (
              <dialog
                ref={dlg}
                open
                class={['v-tooltip--contents']}
                style={style.value}
              >
                {tooltip.value}
              </dialog>
            )}
          </Transition>
          {slots.default?.()}
        </div>
      ) : (
        slots.default?.()
      )
  },
})
