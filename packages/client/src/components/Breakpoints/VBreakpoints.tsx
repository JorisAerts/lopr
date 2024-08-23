import { defineComponent, ref } from 'vue'
import { VUrlFilter } from '../UrlFilter'
import { VBtn, VDialogCardButtons, VSheet } from 'js-proxy-ui/components'

export const VBreakpoints = defineComponent({
  name: 'VBreakpoints',

  setup(props, { slots }) {
    const model = ref()
    const handleClick = (e: MouseEvent) => {
      e.preventDefault()
      console.log({ model: { ...model.value } })
    }

    return () => (
      <VSheet style={{ 'min-width': 'calc(100vw / 3)' }}>
        <VUrlFilter v-model={model.value} />
        <VDialogCardButtons>
          <VBtn onClick={handleClick}>OK</VBtn>
        </VDialogCardButtons>
      </VSheet>
    )
  },
})
