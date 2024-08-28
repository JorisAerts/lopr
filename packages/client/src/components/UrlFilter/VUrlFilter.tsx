import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import type { UrlMatch } from 'js-proxy-shared'
import { VForm, VSheet, VTextField } from 'js-proxy-ui/components'

export const VUrlFilter = defineComponent({
  name: 'VUrlFilter',

  emits: {
    'update:modelValue': (_: UrlMatch) => true,
  },

  props: {
    modelValue: { type: [Object, String] as PropType<string | UrlMatch | undefined> },
  },

  setup(props) {
    return () => (
      <VSheet>
        <VForm>
          <VTextField label={'Protocol'}></VTextField>
        </VForm>
      </VSheet>
    )
  },
})
