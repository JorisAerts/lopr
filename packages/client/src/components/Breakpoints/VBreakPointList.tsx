import type { PropType } from 'vue'
import { defineComponent, toRef } from 'vue'
import type { BreakPoint, UrlMatch } from 'js-proxy-shared'
import { VBtn, VCard, VCheckbox, VList, VListItem, VSheet, VTooltip } from 'js-proxy-ui'

const breakpointToString = (breakPoint: BreakPoint) => {
  let ret = `${
    breakPoint.req && breakPoint.res //
      ? '⇅'
      : breakPoint.req
        ? '↓'
        : breakPoint.res
          ? '↑'
          : '⚠'
  } `

  const match = breakPoint.match

  if (match.protocol) ret += match.protocol
  ret += '://'

  if (match.domain) ret += match.domain
  else ret += '*'

  if (match.port) ret += `:${match.port}`

  ret += '/'
  if (match.path) ret += match.path
  else ret += '*'

  if (match.query) ret += `?${match.query}`

  return ret
}

const defaultValue = {
  protocol: '*',
  domain: '*',
  port: '*',
  path: '*',
  query: '*',
} as UrlMatch
export const VBreakPointList = defineComponent({
  name: 'VBreakPointList',

  emits: {
    'update:breakpoints': (breakpoints: BreakPoint[]) => true,
    'update:modelValue': (breakpoint: BreakPoint | undefined) => true,
  },

  props: {
    breakpoints: { type: Array as PropType<BreakPoint[]>, default: () => [] },
    modelValue: { type: Object as PropType<BreakPoint | undefined> },
  },

  setup(props, { emit }) {
    const breakpoints = toRef(props, 'breakpoints', [])
    const addNewBreakpoint = () => {
      const breakpoint: BreakPoint = { match: { ...defaultValue }, res: false, req: false }
      const newBreakpoints = [...breakpoints.value, breakpoint]
      emit('update:breakpoints', newBreakpoints)

      if (!props.modelValue) emit('update:modelValue', breakpoint)
    }
    const removeSelectedBreakpoint = () => {
      const id = props.modelValue && breakpoints.value.indexOf(props.modelValue)
      if (id != null && id > -1) {
        emit('update:modelValue', undefined)
        emit('update:breakpoints', breakpoints.value.toSpliced(id, 1))
      }
    }
    const handleSelect = (breakpoint: BreakPoint) => props.modelValue !== breakpoint && emit('update:modelValue', breakpoint)

    return () => (
      <VSheet class={['bordered', 'd-flex', 'flex-column', 'overflow-hidden']}>
        <VList class={['flex-grow-1', 'pa-0', 'pt-2']}>
          {breakpoints.value.map((breakpoint, i) => {
            const text = breakpointToString(breakpoint)
            return (
              <VListItem
                key={`${i}-${text}`}
                class={[
                  'py-0',
                  'px-1',
                  {
                    selected: props.modelValue === breakpoint,
                  },
                ]}
                style={{ 'white-space': 'nowrap' }}
                onClick={() => handleSelect(breakpoint)}
              >
                <VCheckbox modelValue={breakpoint.disabled !== true} onUpdate:modelValue={(val) => (breakpoint.disabled = !val || undefined)} />
                <VTooltip text={text}>{text}</VTooltip>
              </VListItem>
            )
          })}
        </VList>
        <VCard flat>
          <VBtn transparent onClick={addNewBreakpoint}>
            +
          </VBtn>
          <VBtn transparent onClick={removeSelectedBreakpoint} disabled={props.modelValue == null}>
            -
          </VBtn>
        </VCard>
      </VSheet>
    )
  },
})
