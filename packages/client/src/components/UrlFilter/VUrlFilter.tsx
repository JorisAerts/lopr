import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import { directives, VForm, VSheet, VTextField } from 'lopr-ui'
import { URI } from 'lopr-shared/URI'
import type { UrlMatch } from 'lopr-shared'

export const VUrlFilter = defineComponent({
  name: 'VUrlFilter',

  emits: {
    'update:modelValue': (_: UrlMatch | undefined) => true,
  },

  directives: {
    autofocus: directives.autofocus,
  },

  props: {
    modelValue: { type: Object as PropType<UrlMatch | undefined> },
  },

  setup(props, { emit }) {
    const updateData = (data: typeof props.modelValue) => {
      emit('update:modelValue', { ...props.modelValue, ...data })
    }

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault()
      const data = e.clipboardData?.getData('text') ?? ''
      try {
        const pasta = URI.parse(data)
        updateData({
          protocol: pasta.protocol ? pasta.protocol : '*',
          domain: pasta.domain || '*',
          port: pasta.port != null ? pasta.port : '*',
          path: pasta.path || '*',
          query: pasta.query || '*',
        })
      } catch {
        //
      }
    }

    const updateField = (field: string, value: unknown) => updateData({ [field]: value })

    return () =>
      props.modelValue && (
        <VSheet>
          <VForm>
            <VTextField
              v-autofocus
              label={'Protocol'}
              onPaste={handlePaste}
              modelValue={props.modelValue.protocol}
              onUpdate:modelValue={(e: string) => updateField('protocol', e)}
            ></VTextField>
            <VSheet class={['d-flex', 'gap-4']}>
              <VTextField
                label={'Host'}
                label-class={['flex-grow-1']}
                onPaste={handlePaste}
                modelValue={props.modelValue.domain}
                onUpdate:modelValue={(e: string) => updateField('domain', e)}
              ></VTextField>
              <VTextField
                label={'Port'}
                onPaste={handlePaste}
                modelValue={props.modelValue.port?.toString()}
                onUpdate:modelValue={(e: string) => updateField('port', e)}
                style={{ width: '7em' }}
              ></VTextField>
            </VSheet>
            <VTextField label={'Path'} onPaste={handlePaste} modelValue={props.modelValue.path} onUpdate:modelValue={(e: string) => updateField('path', e)}></VTextField>
            <VTextField label={'Query'} onPaste={handlePaste} modelValue={props.modelValue.query} onUpdate:modelValue={(e: string) => updateField('query', e)}></VTextField>
          </VForm>
        </VSheet>
      )
  },
})
