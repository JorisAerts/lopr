import { defineComponent } from 'vue'
import { VUrlFilter } from '../UrlFilter'
import { VSheet } from 'js-proxy-ui/components'

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
