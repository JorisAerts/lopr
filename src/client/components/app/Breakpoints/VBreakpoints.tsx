import { defineComponent } from 'vue'
import { VCard, VSheet } from '../../ui'
import { VUrlFilter } from '../UrlFilter'

export const VBreakpoints = defineComponent({
  name: 'VBreakpoints',

  setup(props, { slots }) {
    return () => (
      <VSheet>
        <VCard class={['pa-2']}>
          <VUrlFilter />
        </VCard>
      </VSheet>
    )
  },
})
