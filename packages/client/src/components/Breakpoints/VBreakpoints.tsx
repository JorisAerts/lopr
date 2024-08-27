import { defineComponent, ref } from 'vue'
import { VUrlFilter } from '../UrlFilter'
import { VBtn, VCheckbox, VDialogCardButtons, VSheet } from 'js-proxy-ui/components'

export const VBreakpoints = defineComponent({
  name: 'VBreakpoints',

  setup(props, { slots }) {
    const model = ref()
    const req = ref(false)
    const res = ref(false)

    const handleClick = (e: MouseEvent) => {
      e.preventDefault()
      console.log({ model: { ...model.value } })
    }

    return () => (
      <VSheet style={{ 'min-width': 'calc(100vw / 3)' }}>
        <VUrlFilter v-model={model.value} />
        <VSheet class={['d-flex', 'gap-4', 'align-items-center']}>
          <VCheckbox v-model={req.value}>Request</VCheckbox>
          <VCheckbox v-model={res.value}>Response</VCheckbox>
        </VSheet>
        <VDialogCardButtons>
          <VBtn onClick={handleClick}>OK</VBtn>
        </VDialogCardButtons>
      </VSheet>
    )
  },
})
