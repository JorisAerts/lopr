import { defineComponent } from 'vue'
import { VBtn, VSheet } from 'lopr-ui'
import { pushRoute } from '../../router'
import { RouteNames } from '../../router/RouteNames'

export const Rules = defineComponent({
  name: 'edit-rules',

  setup() {
    return () => (
      <VSheet>
        <VBtn class={['pl-3']} onClick={() => pushRoute({ name: RouteNames.Requests })}>
          ← Back
        </VBtn>
        <h2>Rules</h2>
      </VSheet>
    )
  },
})
