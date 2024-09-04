import { defineComponent, ref, watch } from 'vue'
import { VUrlFilter } from '../UrlFilter'
import { VBtn, VCard, VCheckbox, VDialogCardButtons, VSheet } from 'lopr-ui/components'
import type { BreakPoint } from 'lopr-shared'
import { jsonClone } from 'lopr-shared'
import { useProxyStore } from '../../stores/proxy'
import { VBreakPointList } from './VBreakPointList'

export const VBreakpoints = defineComponent({
  name: 'VBreakpoints',

  emits: {
    close: () => true,
  },

  setup(props, { emit }) {
    const breakpoints = ref(useProxyStore().breakpoints.map((d) => jsonClone(d)))
    const selected = ref<BreakPoint>()
    const updated = ref<BreakPoint>()

    watch(selected, () => (updated.value = jsonClone(selected.value) as BreakPoint))

    const handleClose = (e: MouseEvent) => {
      e.preventDefault()
      emit('close')
    }

    const handleApply = (e: MouseEvent) => {
      useProxyStore().breakpoints = breakpoints.value
    }

    // only update the breakpoints in the store after pressing OK
    // otherwise, updates would immediately alter the original object
    // which would not allow the user to cancel the operation
    const handleCommit = (e: MouseEvent) => {
      handleApply(e)
      handleClose(e)
    }

    return () => (
      <VSheet class={['d-flex', 'flex-column', 'gap-2']} style={{ 'min-width': 'calc(100vw / 3)' }}>
        <VSheet class={['d-flex', 'gap-2']}>
          <VBreakPointList v-model:breakpoints={breakpoints.value} v-model={selected.value} style={{ 'min-width': '150px', 'max-width': '150px' }} />
          <VCard flat class={['pa-2', 'flex-grow-1', 'd-flex', 'flex-column']} style={{ 'min-height': '290px' }}>
            {selected.value ? (
              <>
                <VUrlFilter v-model={selected.value.match} />
                <VSheet class={['d-flex', 'gap-4', 'align-items-center']}>
                  <VCheckbox v-model={selected.value.req}>Request</VCheckbox>
                  <VCheckbox v-model={selected.value.res}>Response</VCheckbox>
                </VSheet>
              </>
            ) : (
              <VSheet class={['flex-grow-1']}>&nbsp;</VSheet>
            )}
          </VCard>
        </VSheet>
        <VDialogCardButtons>
          <VBtn onClick={handleClose}>Cancel</VBtn>
          <VBtn onClick={handleCommit}>OK</VBtn>
        </VDialogCardButtons>
      </VSheet>
    )
  },
})
