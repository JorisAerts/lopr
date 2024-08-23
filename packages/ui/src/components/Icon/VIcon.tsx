import './VIcon.scss'
import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import type { IconNames } from '../../icons/IconNames'
import * as icons from '../../icons'

export const VIcon = defineComponent({
  name: 'v-icon',

  props: {
    name: { type: String as PropType<IconNames> },
    path: { type: String as PropType<string> },
    size: { type: [Number, String] as PropType<number | string>, default: 18 },
    color: { type: String },
  },

  setup(props, { attrs }) {
    return () => (
      <span class={'v-icon'} {...attrs}>
        <svg width={props.size} height={props.size} viewBox={`0 0 24 24`}>
          <path d={props.name ? (icons[props.name] as IconNames) : props.path} style={{ fill: props.color }} />
        </svg>
      </span>
    )
  },
})
