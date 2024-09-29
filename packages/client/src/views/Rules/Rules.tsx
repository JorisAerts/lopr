import { defineComponent, ref } from 'vue'
import { VBtn, VCard, VContainer, VSheet } from 'lopr-ui'
import { pushRoute } from '../../router'
import { RouteNames } from '../../router/RouteNames'
import { useRoute } from 'vue-router'
import { useRulesStore } from '../../stores/rules'

export const Rules = defineComponent({
  name: 'edit-rules',

  setup() {
    const route = useRoute()
    const back = ref(route.meta.from)

    const rulesStore = useRulesStore()

    return () => (
      <VContainer class={['fill-height', 'gap-2']}>
        <VCard
          flat
          class={['fill-height', 'pt-2', 'd-flex', 'flex-column']}
          style={{
            width: '320px',
            'max-width': '320px',
            'min-width': '320px',
          }}
        >
          <VSheet class={['d-flex', 'px-3', 'align-items-center']}>
            <h3 class={['d-flex', 'align-items-center', 'gap-2', 'mb-0']}>
              <VBtn icon={'Close'} onClick={() => pushRoute({ name: RouteNames.Requests, ...(back.value ?? {}) })} /> Rules
            </h3>
          </VSheet>
          <VSheet class={['fill-height', 'overflow-auto', 'my-2', 'px-1']}>
            list with rules
          </VSheet>
        </VCard>
        <VCard flat class={['fill-height', 'overflow-auto', 'flex-grow-1', 'pa-3']}>
        </VCard>
      </VContainer>

    )
  },
})
