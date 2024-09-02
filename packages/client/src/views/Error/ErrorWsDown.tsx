import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import { VBtn, VContainer, VIcon, VSheet } from 'lopr-ui'
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
      <VContainer vertical center class={['fill-height', 'gap-2', 'align-items-center', 'justify-center']}>
        <VSheet class={['d-flex', 'flex-column', 'align-items-center']}>
          <VIcon name={'SentimentVeryDissatisfied'} size={128} />
          <span class={['align-center', 'my-4']}>Darn, the Web Socket seems to be down.</span>
          <VBtn transparent onClick={router.back}>
            ← Back
          </VBtn>
        </VSheet>
      </VContainer>
    )
  },
})
