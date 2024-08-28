import './VBtn.scss'
import type { PropType } from 'vue'
import { defineComponent, ref, watch } from 'vue'
import { makeTooltipProps, useTooltip } from '../Tooltip'
import type { IconNames } from '../Icon'
import { VIcon } from '../Icon'

export enum EventTypes {
  Click = 'click',
  UpdateSelected = 'update:selected',
}

export const VBtn = defineComponent({
  name: 'v-btn',

  emits: {
    [EventTypes.Click]: (e: MouseEvent) => true,
    [EventTypes.UpdateSelected]: (selected: boolean) => true,
  },

  inheritAttrs: false,

  props: {
    icon: { type: String as PropType<IconNames> },
    iconClass: { type: [String, Object, Array] as PropType<any> },
    iconColor: { type: String },
    size: { type: Number, default: 16 },
    dropdown: { type: Boolean, default: false },

    color: { type: String },

    transparent: { type: Boolean, default: false },

    disabled: { type: Boolean, default: false },
    selected: { type: Boolean, default: false },

    ...makeTooltipProps(),
  },

  setup(props, { attrs, emit, slots, expose }) {
    const { wrapWithTooltip } = useTooltip(props, slots)

    const selected = ref(false)
    watch(
      () => props.selected,
      (value, oldValue) => value !== oldValue && emit(EventTypes.UpdateSelected, (selected.value = props.selected)),
      { immediate: true }
    )
    expose({ selected })

    return () => {
      const content = slots.default?.()
      return wrapWithTooltip(
        <button
          class={{
            'v-btn': true,
            'v-btn--transparent': props.transparent,
            'v-btn--disabled': props.disabled,
            'v-btn--selected': selected.value,
          }}
          onClick={(e) => emit(EventTypes.Click, e)}
          {...attrs}
          disabled={props.disabled}
        >
          <span class={'v-btn__underlay'} />
          <span
            class={[
              'v-btn--contents',
              'd-flex',
              {
                'ml-n1': props.dropdown,
              },
            ]}
          >
            {slots.icon?.() ??
              (props.icon && (
                <VIcon
                  class={[
                    {
                      'btn--prepend-icon': ((content as any)?.[0]?.children?.length ?? 0) > 0,
                    },
                    props.iconClass,
                  ]}
                  name={props.icon}
                  color={props.iconColor}
                  size={props.size}
                />
              ))}
            {content}
            {props.dropdown && <VIcon class={['mr-n2']} name={'KeyboardArrowDown'} color={props.iconColor} size={props.size} />}
          </span>
        </button>
      )
    }
  },
})
