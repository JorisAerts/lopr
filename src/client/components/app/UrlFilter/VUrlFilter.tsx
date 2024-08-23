import type { PropType } from 'vue'
import { defineComponent, ref, toRef, watch } from 'vue'
import type { UrlMatch } from '../../../../shared/url-match'
import { VForm, VSheet } from '../../ui'
import TextField from '../../ui/Forms/new/TextField'

export const VUrlFilter = defineComponent({
  name: 'VUrlFilter',

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'update:modelValue': (_: string | UrlMatch | undefined) => true,
  },

  props: {
    modelValue: { type: [Object, String] as PropType<string | UrlMatch | undefined> },
  },

  setup(props, { emit }) {
    const model = ref()
    const modelValue = toRef(props, 'modelValue')
    watch(modelValue, () => (model.value = structuredClone(modelValue.value)), { immediate: true })
    const handleSubmit = () => emit('update:modelValue', model.value)
    return () => (
      <VSheet>
        <VForm onSubmit={handleSubmit}>
          <TextField label={'Protocol'}></TextField>
          <TextField label={'Host'}></TextField>
          <TextField label={'Port'}></TextField>
          <TextField label={'Path'}></TextField>
          <TextField label={'Query'}></TextField>
        </VForm>
      </VSheet>
    )
  },
})
