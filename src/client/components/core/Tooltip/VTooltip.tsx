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
        h: root.value?.offsetHeight ?? 0,
        w: root.value?.offsetWidth ?? 0,
      }
      const tooltip = {
        h: dlg.value?.offsetHeight ?? 0,
        w: dlg.value?.offsetWidth ?? 0,
      }
      const above = pos.y - tooltip.h - props.margin
      return {
        top: `${tooltip.h === 0 ? 0 : above < 0 ? pos.y + pos.h + props.margin : above}px`,
        left: `${tooltip.w === 0 ? 0 : pos.x + tooltip.w + props.margin > document.body.clientWidth ? pos.x + pos.w - tooltip.w : pos.x}px`,
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
