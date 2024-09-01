import './VPieChart.scss'
import type { PropType } from 'vue'
import { computed, defineComponent, ref, watch } from 'vue'

function getCoordinatesForPercent(percent: number) {
  const x = Math.cos(2 * Math.PI * percent)
  const y = Math.sin(2 * Math.PI * percent)
  return [x, y]
}

export const VPieChart = defineComponent({
  name: 'v-pie-chart',

  props: {
    values: { type: Array as PropType<{ value: number; color?: string }[]>, default: () => [] },
    borderWidth: { type: Number, default: 1 },
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
    const svg = ref()
    const total = computed(() => props.values.reduce((a, { value }) => a + value, 0))
    const width = ref(1)
    const height = ref(1)

    watch(svg, () => {
      const bb = svg.value?.getBoundingClientRect()
      width.value = bb ? bb.width : 1
      height.value = bb ? bb.height : 1
    })

    return () => {
      let current = 0
      return (
        <svg class={'v-pie-chart'} viewBox={`${width.value / -2} ${height.value / -2} ${width.value} ${height.value}`} ref={svg}>
          {props.values.map((item, index) => {
            const { value } = item
            const percent = value / total.value
            const [startX, startY] = getCoordinatesForPercent(current)
            const [endX, endY] = getCoordinatesForPercent((current += percent))
            const d = `M ${(startX * width.value) / 2} ${(startY * height.value) / 2} A  ${width.value / 2} ${height.value / 2} 0 ${percent > 0.5 ? 1 : 0} 1 ${(endX * width.value) / 2} ${(endY * height.value) / 2} L 0 0 Z`
            const strokeWidth = props.borderWidth != 1 ? props.borderWidth : undefined
            const fill = item.color ?? (props.colors[index % props.colors.length] as string)
            return <path d={d} fill={fill} stroke-width={strokeWidth} />
          })}
        </svg>
      )
    }
  },
})
