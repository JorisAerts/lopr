import type { PropType } from 'vue'
import { defineComponent, ref, toRef, watch } from 'vue'
import type { UrlMatch } from 'js-proxy-shared/url-match'
import { VForm, VSheet, VTextField } from 'js-proxy-ui'
import { URI } from 'js-proxy-shared/URI'

const defaultValue = {
  protocol: '*',
  domain: '*',
  port: '*',
  path: '*',
  query: '*',
} as UrlMatch

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
    const model = ref<UrlMatch | undefined>({ ...defaultValue } as UrlMatch)

    const modelValue = toRef(props, 'modelValue', undefined)
    watch(
      modelValue,
      () => {
        switch (typeof modelValue.value) {
          case 'string':
            return (model.value = new URI(modelValue.value))
          case 'object':
            return (model.value = { ...modelValue.value })
          default:
            return (model.value = { ...defaultValue })
        }
      },
      { immediate: true }
    )
    const handleSubmit = () => emit('update:modelValue', model.value)
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault()
      const data = e.clipboardData?.getData('text') ?? ''
      try {
        const pasta = URI.parse(data)
        model.value = {
          protocol: pasta.protocol ? `${pasta.protocol}://` : '*',
          domain: pasta.domain || '*',
          port: pasta.port != null ? `${pasta.port}` : '*',
          path: pasta.path || '*',
          query: pasta.query || '*',
        }
      } catch {
        model.value = {}
      } finally {
        emit('update:modelValue', model.value)
      }
    }

    return () => (
      <VSheet>
        <VForm onSubmit={handleSubmit}>
          <VTextField label={'Protocol'} onPaste={handlePaste} v-model={model.value!.protocol}></VTextField>
          <VSheet class={['d-flex', 'gap-4']}>
            <VTextField label-class={['flex-grow-1']} label={'Host'} onPaste={handlePaste} v-model={model.value!.domain}></VTextField>
            <VTextField label={'Port'} onPaste={handlePaste} v-model={model.value!.port} style={{ width: '7em' }}></VTextField>
          </VSheet>
          <VTextField label={'Path'} onPaste={handlePaste} v-model={model.value!.path}></VTextField>
          <VTextField label={'Query'} onPaste={handlePaste} v-model={model.value!.query}></VTextField>
        </VForm>
      </VSheet>
    )
  },
})
