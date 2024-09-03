import { defineComponent } from 'vue'
import { VBtn, VCard, VDialogCard, VDialogCardButtons } from 'lopr-ui'

export const VAbout = defineComponent({
  name: 'VAbout',

  emits: ['close'],

  setup(props, { emit }) {
    return () => (
      <VDialogCard class={['d-flex', 'flex-column', 'pa-3', 'gap-2']}>
        <h2 class={'mb-2'}>lopr 0.0.4</h2>
        <VCard flat class={['pa-3']}>
          <div>Joris Aerts © 2024</div>
          <div>
            <a href={'https://github.com/JorisAerts/lopr'} target={'github'}>
              https://github.com/JorisAerts/lopr
            </a>
          </div>
        </VCard>
        <VDialogCardButtons>
          <VBtn onClick={() => emit('close')}>OK</VBtn>
        </VDialogCardButtons>
      </VDialogCard>
    )
  },
})
