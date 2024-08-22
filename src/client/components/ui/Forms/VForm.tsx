import { defineComponent, withModifiers } from 'vue'

export const VForm = defineComponent({
  name: 'v-form',

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    submit: (event: SubmitEvent) => true,
  },

  props: {
    disabled: { type: Boolean, default: false },
  },

  setup(props, { slots, emit }) {
    return () => (
      <form class={'v-form'} aria-disabled={props.disabled} onSubmit={withModifiers((e) => emit('submit', e as SubmitEvent), ['prevent'])}>
        {slots.default?.()}
      </form>
    )
  },
})
