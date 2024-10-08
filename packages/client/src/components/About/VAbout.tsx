import { defineComponent } from 'vue'
import { addDOMListenerOnMounted, VBtn, VCard, VDialogCard, VDialogCardButtons, VIcon } from 'lopr-ui'
import { APP_NAME, APP_VERSION } from 'lopr-shared'

export const VAbout = defineComponent({
  name: 'VAbout',

  emits: ['close'],

  setup(props, { emit }) {
    const close = () => emit('close')

    addDOMListenerOnMounted(document, 'keydown', (e: KeyboardEvent) => {
      if (['Enter', 'Escape', 'Backspace', ' '].includes(e.key)) {
        e.preventDefault()
        close()
      }
    })

    return () => (
      <VDialogCard class={['d-flex', 'flex-column', 'pa-3', 'gap-2']}>
        <h2 class={'mb-2'}>
          <VIcon name={'DominoMask_Fill'} size={28} class={['mr-1']} /> {APP_NAME} {APP_VERSION}
        </h2>
        <VCard flat class={['pa-3']}>
          <div>Joris Aerts © 2024</div>
          <div>
            <a href={'https://github.com/JorisAerts/lopr'} target={'github'}>
              https://github.com/JorisAerts/lopr
            </a>
          </div>
        </VCard>
        <VDialogCardButtons>
          <VBtn onClick={close}>OK</VBtn>
        </VDialogCardButtons>
      </VDialogCard>
    )
  },
})
