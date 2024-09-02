import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import { VContainer } from 'lopr-ui'

export const Error404 = defineComponent({
  name: 'v-error-404',

  props: {
    width: {
      type: [Number, String] as PropType<number | string>,
    },
  },

  setup() {
    return () => (
      <VContainer vertical center class={['fill-height', 'gap-2', 'align-items-center']}>
        <span class={'align-center'}>404 — Not found</span>
      </VContainer>
    )
  },
})
