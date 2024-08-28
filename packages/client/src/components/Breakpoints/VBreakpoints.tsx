import { defineComponent, ref } from 'vue'
import { VUrlFilter } from '../UrlFilter'
import { VBtn, VCard, VCheckbox, VDialogCardButtons, VList, VListItem, VSheet, VTooltip } from 'js-proxy-ui/components'
import type { BreakPoint } from '../../stores/proxy'
import { useProxyStore } from '../../stores/proxy'
import type { UrlMatch } from 'js-proxy-shared'

const matchToString = (match: UrlMatch) => {
  let ret = ''

  if (match.protocol) ret += `${match.protocol}`
  else ret += '://'

  if (match.domain) ret += match.domain
  else ret += '*'

  if (match.port) ret += `:${match.port}`

  ret += '/'
  if (match.path) ret += match.path
  else ret += '*'

  if (match.query) ret += `?${match.query}`

  return ret
}

export const VBreakpoints = defineComponent({
  name: 'VBreakpoints',

  emits: {
    close: () => true,
  },

  setup(props, { emit }) {
    const proxyStore = useProxyStore()
    const orig = ref<BreakPoint>()
    const selected = ref<BreakPoint>()

    const handleClick = (e: MouseEvent) => {
      e.preventDefault()
      if (orig.value && selected.value) Object.assign(orig.value, selected.value)
      emit('close')
    }

    const addNewBreakpoint = () => {
      proxyStore.breakpoints.push({
        match: {},
        res: false,
        req: false,
      })
    }

    const handleSelect = (breakpoint: BreakPoint | undefined) => {
      orig.value = breakpoint
      selected.value = breakpoint ? ({ ...breakpoint } as BreakPoint) : undefined
    }

    return () => (
      <VSheet class={['d-flex', 'gap-2']} style={{ 'min-width': 'calc(100vw / 3)' }}>
        <VSheet class={['bordered', 'd-flex', 'flex-column', 'overflow-hidden']} style={{ 'min-width': '100px', 'max-width': '150px' }}>
          <VList class={['flex-grow-1', 'pa-0']}>
            {proxyStore.breakpoints.map((breakpoint, i) => {
              const text = matchToString(breakpoint.match)
              return (
                <VListItem
                  key={i}
                  class={[
                    'py-0',
                    'px-1',
                    {
                      selected: selected.value === breakpoint,
                    },
                  ]}
                  onClick={() => handleSelect(breakpoint)}
                >
                  <VCheckbox modelValue={breakpoint.disabled !== true} onUpdate:modelValue={(val) => (breakpoint.disabled = !val || undefined)} />
                  <VTooltip text={text}>{text}</VTooltip>
                </VListItem>
              )
            })}
          </VList>
          <VCard>
            <VBtn transparent onClick={addNewBreakpoint}>
              +
            </VBtn>
            <VBtn transparent>-</VBtn>
          </VCard>
        </VSheet>
        <VSheet class={['flex-grow-1']}>
          {selected.value && (
            <>
              <VUrlFilter v-model={selected.value.match} />
              <VSheet class={['d-flex', 'gap-4', 'align-items-center']}>
                <VCheckbox v-model={selected.value.req}>Request</VCheckbox>
                <VCheckbox v-model={selected.value.res}>Response</VCheckbox>
              </VSheet>
            </>
          )}
          <VDialogCardButtons>
            <VBtn onClick={handleClick}>OK</VBtn>
          </VDialogCardButtons>
        </VSheet>
      </VSheet>
    )
  },
})
