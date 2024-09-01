import type { PropType } from 'vue'
import { computed, defineComponent } from 'vue'

function getCoordinatesForPercent(percent: number) {
  const x = Math.cos(2 * Math.PI * percent)
  const y = Math.sin(2 * Math.PI * percent)
  return [x, y]
}

export const VPieChart = defineComponent({
  name: 'v-pie-chart',

  props: {
    values: { type: Array as PropType<{ value: number; color?: string }[]>, default: () => [] },
    colors: {
      type: Array,
      default: () => [
        //
        '#800000',
        '#008000',
        '#000080',
        '#808000',
        '#800080',
        '#008080',
      ],
    },
  },

  setup(props, { slots }) {
    const total = computed(() => props.values.reduce((a, { value }) => a + value, 0))
    return () => {
      let current = 0
      return (
        <svg viewBox="-1 -1 2 2">
          {props.values.map((item, index) => {
            const { value } = item
            const percent = value / total.value
            const [startX, startY] = getCoordinatesForPercent(current)
            const [endX, endY] = getCoordinatesForPercent((current += percent))
            const d = `M ${startX} ${startY} A 1 1 0 ${percent > 0.5 ? 1 : 0} 1 ${endX} ${endY} L 0 0 Z`
            return (
              <path
                d={d}
                fill={item.color ?? (props.colors[index % props.colors.length] as string)}
                /*
                stroke={'rgba(var(--text-color))'}
                stroke-width={0.02}
                */
              />
            )
          })}
        </svg>
      )
    }
  },
})
