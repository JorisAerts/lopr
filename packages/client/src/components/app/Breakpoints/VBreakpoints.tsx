import { defineComponent } from 'vue'
import { VSheet } from '../../ui'
import { VUrlFilter } from '../UrlFilter'

export const VBreakpoints = defineComponent({
  name: 'VBreakpoints',

  setup(props, { slots }) {
    return () => (
      <VSheet style={{ 'min-width': 'calc(100vw / 3)' }}>
        <VUrlFilter />
      </VSheet>
    )
  },
})
