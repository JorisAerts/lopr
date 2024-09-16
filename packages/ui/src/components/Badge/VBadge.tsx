import type { PropType } from 'vue'
import { computed, defineComponent, Transition } from 'vue'
import './VBadge.scss'

export const VBadge = defineComponent({
  name: 'v-badge',

  props: {
    modelValue: { type: [Number, String, Boolean], default: false },
    position: { type: [Number, Array] as PropType<number | (undefined | number)[]>, default: 0 },
    color: { type: String },
    dot: { type: Boolean, default: false },
    size: { type: Number, default: 6 },
  },

  setup(props, { slots }) {
    const show = computed(() => props.modelValue !== false && props.modelValue != null)
    const badgeText = computed(() =>
      typeof props.modelValue === 'string' && props.modelValue.length > 0
        ? props.modelValue
        : typeof props.modelValue === 'number'
          ? props.modelValue === Infinity
            ? '∞'
            : isNaN(props.modelValue)
              ? '?'
              : props.modelValue
          : undefined
    )
    const badgeStyle = computed(() => {
      const pos = Array.isArray(props.position) ? props.position : [props.position]
      return {
        ...(props.color && { background: props.color?.startsWith('--') ? `rgb(var(${props.color}))` : props.color }),
        ...(props.dot && {
          width: `${props.size}px`,
          height: `${props.size}px`,
          top: `${pos[0] ?? 0}px`,
          right: `${0 - (pos[1] ?? 0)}px`,
        }),
      }
    })
    return () => (
      <div class={'v-badge'}>
        <div class={'v-badge--wrapper'}>{slots.default?.()}</div>
        <Transition>
          {show.value && (
            <div
              class={[
                'v-badge--badge',
                {
                  'v-badge--dot': props.dot,
                  'v-badge--text': !props.dot && badgeText.value,
                },
              ]}
              style={badgeStyle.value}
            >
              {badgeText.value}
            </div>
          )}
        </Transition>
      </div>
    )
  },
})
