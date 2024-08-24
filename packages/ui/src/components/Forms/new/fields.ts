import type { ExtractPropTypes, PropType } from 'vue'
import type { IconNames } from '../../../icons/IconNames'

export const makeInputFieldTypeProps = () => ({
  type: { type: String as PropType<HTMLInputElement['type']>, default: 'text' },
})

export type InputFieldTypeProps = ExtractPropTypes<ReturnType<typeof makeInputFieldTypeProps>>

export const makeInputFieldProps = () => ({
  name: { type: String },
  autocomplete: { type: String },
  icon: { type: String as PropType<IconNames> },
  label: { type: String },
  modelValue: { type: String },
  placeholder: { type: String },
  clearable: { type: Boolean, default: true },

  autoFocus: { type: Boolean, default: false },
})
