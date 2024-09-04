import './VDialogCard.scss'
import { defineComponent, inject } from 'vue'
import { VSheet } from '../Sheet'
import { VSpacer } from '../Spacer'
import { VBtn } from '../Btn'
import { DIALOG_CLOSE_SYMBOL } from './dialog'

export const VDialogTitle = defineComponent({
  name: 'v-dialog-title',

  props: {
    closeable: { type: Boolean, default: false },
  },

  setup(props, { slots }) {
    const close: undefined | (() => void) = inject(DIALOG_CLOSE_SYMBOL)
    return () =>
      props.closeable ? (
        <VSheet class={['d-flex', 'mb-2', 'align-items-center']}>
          <h3 class={['mb-0']}>{slots.default?.()}</h3>
          <VSpacer />
          {slots.closeButton?.() ?? <VBtn icon={'Close'} class={'pa-1'} onClick={close} />}
        </VSheet>
      ) : (
        <h3 class={'mb-2'}>{slots.default?.()}</h3>
      )
  },
})
