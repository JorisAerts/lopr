import './VSwitch.scss'
import type { PropType } from 'vue'
import { defineComponent, toRefs, watch } from 'vue'
import type { IconNames } from '../Icon'
import { VIcon } from '../Icon'

export const VSwitch = defineComponent({
  name: 'VSwitch',

  emits: {
    change: (value: any) => true,
    'update:checked': (value: boolean) => true,
  },

  props: {
    name: { type: String },
    value: { type: [String, Number, Boolean, Date, Object] as PropType<unknown>, default: () => true },
    checked: { type: Boolean, default: false },

    onIcon: { type: String as PropType<IconNames> },
    offIcon: { type: String as PropType<IconNames> },
  },

  setup(props, { emit, slots }) {
    const { checked, value } = toRefs(props)
    watch(checked, () => {})
    const onClick = (event: Event) => {
      event.preventDefault()
      const newValue = !checked.value
      emit('update:checked', newValue)
      emit('change', newValue ? props.value : undefined)
    }
    return () => (
      <div class={['v-switch', 'py-4']} onClick={onClick}>
        {slots.default?.()}
        <input class={['v-switch--input']} name={props.name} type="checkbox" value={value.value} checked={checked.value} />
        <div class={['v-switch--backdrop']}></div>
        <div
          class={[
            'v-switch--slider',
            {
              'v-switch--slider-on': checked.value,
              'v-switch--slider-off': !checked.value,
            },
          ]}
        >
          {checked.value //
            ? (slots.on?.() ?? (props.onIcon && <VIcon name={props.onIcon} size={'1em'} />) ?? undefined)
            : (slots.off?.() ?? (props.offIcon && <VIcon name={props.offIcon} size={'1em'} />) ?? undefined)}
        </div>
      </div>
    )
  },
})