import type { PropType } from 'vue'
import { defineComponent, ref, toRef, watch } from 'vue'
import type { UrlMatch } from 'js-proxy-shared/url-match'
import { VForm, VSheet, VTextField } from 'js-proxy-ui'
import { URI } from 'js-proxy-shared/URI'

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
    const model = ref<UrlMatch | undefined>({
      protocol: '',
      domain: '',
      port: '',
      path: '',
      query: '',
    } as UrlMatch)

    const modelValue = toRef(props, 'modelValue')
    watch(
      modelValue,
      () => {
        switch (typeof modelValue.value) {
          case 'string':
            return (model.value = new URI(modelValue.value))
          case 'object':
            return (model.value = structuredClone(modelValue.value as UrlMatch))
          default:
            return (model.value = {
              protocol: '',
              domain: '',
              port: '',
              path: '',
              query: '',
            })
        }
      },
      { immediate: true }
    )
    const handleSubmit = () => emit('update:modelValue', model.value)
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault()
      const pasta = URI.parse(e.clipboardData?.getData('text') ?? '')
      emit(
        'update:modelValue',
        (model.value = {
          protocol: `${pasta.protocol}://`,
          domain: pasta.domain,
          port: `${pasta.port}`,
          path: pasta.path,
          query: pasta.query,
        })
      )
    }

    return () => (
      <VSheet>
        <VForm onSubmit={handleSubmit}>
          <VTextField label={'Protocol'} onPaste={handlePaste} v-model={model.value!.protocol}></VTextField>
          <VTextField label={'Host'} onPaste={handlePaste} v-model={model.value!.domain}></VTextField>
          <VTextField label={'Port'} onPaste={handlePaste} v-model={model.value!.port}></VTextField>
          <VTextField label={'Path'} onPaste={handlePaste} v-model={model.value!.path}></VTextField>
          <VTextField label={'Query'} onPaste={handlePaste} v-model={model.value!.query}></VTextField>
        </VForm>
      </VSheet>
    )
  },
})
