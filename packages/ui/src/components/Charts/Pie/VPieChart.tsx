import './VPieChart.scss'
import type { PropType } from 'vue'
import { computed, defineComponent, ref, watch } from 'vue'
import { defaultColors } from '../Chart/colors'

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
      default: () => [...defaultColors],
    },
  },

  setup(props) {
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
      const w = width.value - props.borderWidth
      const h = height.value - props.borderWidth
      return (
        <svg class={'v-pie-chart'} viewBox={`${width.value / -2} ${height.value / -2} ${width.value} ${height.value}`} ref={svg}>
          {props.values.map((item, index) => {
            const { value } = item
            const percent = value / total.value
            const [startX, startY] = getCoordinatesForPercent(current)
            const [endX, endY] = getCoordinatesForPercent((current += percent))
            const d = `M ${(startX * w) / 2} ${(startY * h) / 2} A ${w / 2} ${h / 2} 0 ${percent > 0.5 ? 1 : 0} 1 ${(endX * w) / 2} ${(endY * h) / 2} L 0 0 Z`
            const fill = item.color ?? (props.colors[index % props.colors.length] as string)
            const style = props.borderWidth != 1 ? { 'stroke-width': props.borderWidth } : undefined
            return <path d={d} fill={fill} style={style} />
          })}
        </svg>
      )
    }
  },
})
