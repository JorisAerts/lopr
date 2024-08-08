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
    const enter = () => (timer = setTimeout(() => (show.value = true), props.delay))

    const leave = () => {
      clearTimeout(timer)
      show.value = false
    }
    const style = computed(() => {
      if (!root.value) return { display: 'none' }
      const pos = {
        x: root.value?.offsetLeft ?? 0,
        y: root.value?.offsetTop ?? 0,
        h: (root.value?.offsetHeight ?? 0) + props.margin,
        w: root.value?.offsetWidth ?? 0,
      }
      const tooltip = {
        h: (dlg.value?.offsetHeight ?? 0) + props.margin,
        w: (dlg.value?.offsetWidth ?? 0) + props.margin,
      }
      return {
        top: pos.y - tooltip.h < 0 ? `${pos.y + pos.h}px` : `${pos.y - tooltip.h}px`,
        left: pos.x + tooltip.w > document.body.clientWidth ? `${pos.x - (tooltip.w - props.margin) + pos.w}px` : `${pos.x}px`,
      }
    })
    const tooltip = computed(() => slots.tooltip?.() ?? props.text)
    return () =>
      tooltip.value ? (
        <div class={'v-tooltip'} onMouseenter={enter} onMouseleave={leave} ref={root}>
          <Transition>
            {show.value && (
              <dialog ref={dlg} open class={['v-tooltip--contents']} style={style.value}>
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
