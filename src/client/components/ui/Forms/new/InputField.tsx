import './InputField.scss'

import { defineComponent, onMounted, ref } from 'vue'
import LabelWrapper from './LabelWrapper'
import { makeInputFieldProps, makeInputFieldTypeProps } from './fields'
import { VIcon } from '../../Icon'

export default defineComponent({
  name: 'v-input-field',

  emits: ['update:modelValue'],

  props: {
    ...makeInputFieldTypeProps(),
    ...makeInputFieldProps(),
  },

  inheritAttrs: false,

  setup(props, { emit, attrs }) {
    const input = ref()
    const focus = () => input.value?.focus()

    onMounted(() => {
      if (props.autoFocus) input.value?.focus()
    })

    return () => (
      <LabelWrapper modelValue={props.label}>
        <div class={['v-input-field']} {...attrs} onMousedown={focus}>
          {props.icon && <VIcon class={'v-input-field--icon'} name={props.icon} size={16} />}
          <input
            name={props.name}
            autocomplete={props.autocomplete}
            ref={input}
            type={props.type}
            value={props.modelValue}
            onInput={(event: Event) => {
              emit('update:modelValue', (event.target as HTMLInputElement)?.value)
            }}
          />
          {props.clearable && (
            <VIcon
              class={{
                clearable: true,
                'clearable--icon': true,
                'clearable--disabled': (props.modelValue?.length ?? 0) === 0,
              }}
              name="Cancel_Fill"
              size={16}
              {...{
                onClick: () => props.modelValue && emit('update:modelValue', null),
              }}
            />
          )}
        </div>
      </LabelWrapper>
    )
  },
})
