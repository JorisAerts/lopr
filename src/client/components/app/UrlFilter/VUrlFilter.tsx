import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import type { UrlMatch } from '../../../../shared/url-match'

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
    return () => (props ? {} : null)
  },
})
