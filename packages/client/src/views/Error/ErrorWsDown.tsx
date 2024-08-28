import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import { VContainer } from 'js-proxy-ui'
import { useRouter } from 'vue-router'

export const ErrorWsDown = defineComponent({
  name: 'v-error-websocket-down',

  props: {
    width: {
      type: [Number, String] as PropType<number | string>,
    },
  },

  setup() {
    const router = useRouter()
    return () => (
      <VContainer vertical center class={['fill-height', 'gap-2', 'align-items-center']}>
        <span class={'align-center'}>Darn, the Web Socket seems to be down.</span>
        <a href={'javascript:history.back()'} onClick={router.back}>
          Back
        </a>
      </VContainer>
    )
  },
})
