import './VTabs.scss'
import type { ComponentPublicInstance, PropType} from 'vue';
import { defineComponent, nextTick, onUpdated, ref, watch } from 'vue'
import { VSheet } from '../Sheet'
import { VContainer } from '../Container'
import { defineTabs, makeTabsProps } from './tabs'
import { VTabSlider } from './VTabSlider'

export const VTabs = defineComponent({
  name: 'v-tabs',

  props: {
    modelValue: {
      ...makeTabsProps(),
      type: [String, Number, Object] as PropType<any>,
    },
  },

  setup(props, { slots }) {
    const root = ref<ComponentPublicInstance>()
    const { modelValue, selectedClass } = defineTabs(props)
    const sliderDim = ref({ x: 0, y: 0, w: 0 })

    const updateSlider = () => {
      const el = root.value?.$el
      if (!el) return

      const selectedEl = el.querySelector(`.v-tabs--items .${selectedClass}`)
      if (!selectedEl) return

      sliderDim.value.x = selectedEl.offsetLeft
      sliderDim.value.y = selectedEl.offsetTop + selectedEl.offsetHeight
      sliderDim.value.w = selectedEl.offsetWidth
    }

    watch(modelValue, () => nextTick().then(() => updateSlider), { immediate: true })
    onUpdated(updateSlider)

    return () => (
      <VSheet class={['v-tabs', 'v-tabs--horizontal']} ref={root}>
        <VContainer class={'v-tabs--items'}> {slots.default?.()}</VContainer>
        {slots.slider?.(sliderDim.value) ?? <VTabSlider top={sliderDim.value.y} left={sliderDim.value.x} width={sliderDim.value.w} />}
      </VSheet>
    )
  },
})
