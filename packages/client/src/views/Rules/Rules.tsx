import { defineComponent, ref } from 'vue'
import { VBtn, VSheet } from 'lopr-ui'
import { pushRoute } from '../../router'
import { RouteNames } from '../../router/RouteNames'
import { useRoute } from 'vue-router'

export const Rules = defineComponent({
  name: 'edit-rules',

  setup() {
    const route = useRoute()
    const back = ref(route.meta.from)
    return () => (
      <VSheet>
        <VBtn class={['pl-3']} onClick={() => pushRoute({ name: RouteNames.Requests, ...(back.value ?? {}) })}>
          ← Back
        </VBtn>
        <h2>Rules</h2>
      </VSheet>
    )
  },
})
