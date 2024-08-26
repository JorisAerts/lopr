import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import type { IconNames } from '../Icon'
import { VIcon } from '../Icon'
import './VList.scss'
import { makeTooltipProps, useTooltip } from '../Tooltip'

export const VListItem = defineComponent({
  name: 'v-list-item',

  emits: ['click'],

  props: {
    noIcons: { type: Boolean, default: false },
    prependIcon: {
      type: [String, Boolean] as PropType<IconNames | boolean>,
      default: undefined,
    },
    appendIcon: {
      type: [String, Boolean] as PropType<IconNames | boolean>,
      default: undefined,
    },
    ...makeTooltipProps(),
  },

  setup(props, { attrs, slots, emit }) {
    const { wrapWithTooltip } = useTooltip(props, slots)
    const renderIcon = (name: IconNames | boolean | undefined, className: string) =>
      name === false ? undefined : <VIcon class={className} color={'currentColor'} name={name === true ? undefined : name} size={20} />

    return () => (
      <div class={'v-list-item'} {...attrs} onClick={(e: MouseEvent) => emit('click', e)}>
        {wrapWithTooltip(
          <div class={['v-list-item--contents']}>
            {slots.prepend?.()}
            {props.prependIcon && renderIcon(props.prependIcon, 'v-list-item--prepend-icon')}
            {slots.default?.()}
            {props.appendIcon && renderIcon(props.appendIcon, 'v-list-item--append-icon')}
            {slots.append?.()}
          </div>
        )}
      </div>
    )
  },
})
