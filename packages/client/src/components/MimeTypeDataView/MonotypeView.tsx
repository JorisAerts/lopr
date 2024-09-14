import { defineComponent } from 'vue'
import { VCheckbox, VSheet, VToolbar } from 'lopr-ui'
import { makeMimeTypeProps } from './mime-type'

export const MonotypeView = defineComponent({
  name: 'MonotypeView',

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'update:wrap': (_: boolean) => true,
  },

  props: {
    ...makeMimeTypeProps(),
    wrap: { type: Boolean, default: false },
  },

  setup(props, { emit }) {
    return () => (
      <VSheet class={['pa-2', 'overflow-auto']}>
        <VToolbar class={['mt-1', 'mb-2']}>
          <VCheckbox label={'Wrap'} modelValue={props.wrap} onUpdate:modelValue={(checked) => emit('update:wrap', checked)} />
        </VToolbar>
        <pre
          class={['text-mono']}
          style={{
            whiteSpace: props.wrap ? 'pre-wrap' : 'pre',
          }}
        >
          {props.data}
        </pre>
      </VSheet>
    )
  },
})
