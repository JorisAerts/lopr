import './VTabItems.scss'
import { defineComponent, provide, toRef, Transition } from 'vue'
import { VSheet } from '../Sheet'
import { makeTabItemsProps, TAB_SYMBOL } from './tabs'

export const VTabItems = defineComponent({
  name: 'v-tab-items',

  props: {
    ...makeTabItemsProps(),
    transition: { type: Boolean, default: false },
  },

  setup(props, { slots }) {
    const modelValue = toRef(props, 'modelValue')
    provide(TAB_SYMBOL, modelValue)
    return () => {
      return (
        <VSheet class={'v-tab-items'}>
          {props.transition ? ( //
            <Transition duration={0.25}>{slots.default?.()}</Transition>
          ) : (
            slots.default?.()
          )}
        </VSheet>
      )
    }
  },
})
