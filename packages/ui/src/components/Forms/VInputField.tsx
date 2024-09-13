import './VInputField.scss'
import type { PropType } from 'vue'
import { defineComponent, onMounted, ref, Transition } from 'vue'
import { VLabelWrapper } from './VLabelWrapper'
import { makeInputFieldProps, makeInputFieldTypeProps } from './fields'
import { VIcon } from '../Icon'

export const VInputField = defineComponent({
  name: 'v-input-field',

  emits: ['update:modelValue'],

  props: {
    ...makeInputFieldTypeProps(),
    ...makeInputFieldProps(),

    labelClass: { type: [String, Array, Object] as PropType<any> },
  },

  inheritAttrs: false,

  setup(props, { emit, attrs }) {
    const input = ref()
    const focus = () => input.value?.focus()

    onMounted(() => {
      if (props.autoFocus) input.value?.focus()
    })

    return () => (
      <VLabelWrapper modelValue={props.label} class={props.labelClass} style={attrs.style}>
        <div class={['v-input-field']} {...{ ...attrs, style: undefined }} onMousedown={focus}>
          {props.icon && <VIcon class={'v-input-field--icon'} name={props.icon} size={16} />}
          <input
            name={props.name}
            autocomplete={props.autocomplete}
            ref={input}
            type={props.type}
            value={props.modelValue}
            placeholder={props.placeholder}
            onInput={(event: Event) => {
              emit('update:modelValue', (event.target as HTMLInputElement)?.value)
            }}
          />
          <Transition>
            {props.clearable && (
              <VIcon
                class={['clearable', 'clearable--icon', { 'clearable--disabled': (props.modelValue?.length ?? 0) === 0 }]}
                name="Cancel_Fill"
                size={16}
                {...{
                  onClick: () => props.modelValue && emit('update:modelValue', null),
                }}
              />
            )}
          </Transition>
        </div>
      </VLabelWrapper>
    )
  },
})
