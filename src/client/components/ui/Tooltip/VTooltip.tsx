import { computed, defineComponent, ref, Transition } from 'vue'
import { VCard } from '../Card'
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
    const enter = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => (show.value = true), props.delay)
    }
    const leave = () => {
      clearTimeout(timer)
      show.value = false
      timer = undefined
    }
    const style = computed(() => {
      if (!root.value) return { display: 'none' }
      const bb = root.value?.getBoundingClientRect()
      console.log({
        scroll: [root.value?.offsetLeft, root.value?.scrollTop],
        offset: [root.value?.offsetLeft ?? 0, root.value?.offsetTop],
        client: [root.value?.clientLeft ?? 0, root.value?.clientTop],

        bb,
      })
      const pos = { x: bb.x, y: bb.y, h: bb.width, w: bb.height }
      const tooltip = {
        h: dlg.value?.offsetHeight ?? 0,
        w: dlg.value?.offsetWidth ?? 0,
      }
      const above = pos.y - tooltip.h - props.margin - 5 // -5, because you don't want to stick it to the top either
      return {
        top: `${tooltip.h === 0 ? 0 : above < 0 ? pos.y + pos.h + props.margin : above}px`,
        left: `${tooltip.w === 0 ? 0 : pos.x + tooltip.w + props.margin > document.body.clientWidth ? pos.x + pos.w - tooltip.w : pos.x}px`,
      }
    })
    const tooltip = computed(
      () =>
        slots.tooltip?.() ?? (
          <VCard class={['v-tooltip--contents']}>
            {props.text?.split('\n').flatMap((line, i, arr) => {
              return [line, i < arr.length - 1 ? <br /> : undefined]
            })}
          </VCard>
        )
    )
    return () =>
      tooltip.value ? (
        <div class={'v-tooltip'}>
          {show.value && (
            <dialog ref={dlg} open class={['v-tooltip--popup']} style={style.value}>
              <Transition>{tooltip.value}</Transition>
            </dialog>
          )}
          <div onMouseenter={enter} onMouseleave={leave} ref={root}>
            {slots.default?.()}
          </div>
        </div>
      ) : (
        slots.default?.()
      )
  },
})
