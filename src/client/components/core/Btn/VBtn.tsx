import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import type { IconNames } from '../Icon'
import { VIcon } from '../Icon'
import './VBtn.scss'

export enum EventTypes {
  Click = 'click',
}

export const VBtn = defineComponent({
  name: 'v-btn',

  emits: [EventTypes.Click],

  inheritAttrs: false,

  props: {
    icon: { type: String as PropType<IconNames> },
    iconColor: { type: String },
    size: { type: Number, default: 16 },
    dropdown: { type: Boolean, default: false },

    color: { type: String },

    transparent: { type: Boolean, default: false },

    disabled: { type: Boolean, default: false },
  },

  setup(props, { attrs, emit, slots }) {
    return () => {
      const content = slots.default?.()
      return (
        <button
          class={{
            'v-btn': true,
            'v-btn--transparent': props.transparent,
            'v-btn--disabled': props.disabled,
          }}
          onClick={(e) => emit(EventTypes.Click, e)}
          {...attrs}
          disabled={props.disabled}
        >
          <span class={'v-btn__underlay'} />
          <span
            class={[
              'v-btn--content',
              'd-flex',
              {
                'ml-n1': props.dropdown,
              },
            ]}
          >
            {slots.icon?.() ??
              (props.icon && (
                <VIcon
                  class={{
                    'btn--prepend-icon': ((content as any)?.[0]?.children?.length ?? 0) > 0,
                  }}
                  name={props.icon}
                  color={props.iconColor}
                  size={props.size}
                ></VIcon>
              ))}
            {content}
            {props.dropdown && <VIcon class={['mr-n2']} name={'KeyboardArrowDown'} color={props.iconColor} size={props.size} />}
          </span>
        </button>
      )
    }
  },
})
