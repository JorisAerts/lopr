import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import type { UrlMatch } from 'js-proxy-shared/url-match'
import { VForm, VSheet } from 'js-proxy-ui/components'
import TextField from '../../../../../ui/src/components/Forms/new/TextField'

export const VUrlFilter = defineComponent({
  name: 'VUrlFilter',

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'update:modelValue': (_: UrlMatch) => true,
  },

  props: {
    modelValue: { type: [Object, String] as PropType<string | UrlMatch | undefined> },
  },

  setup(props) {
    return () => (
      <VSheet>
        <VForm>
          <TextField label={'Protocol'}></TextField>
        </VForm>
      </VSheet>
    )
  },
})
