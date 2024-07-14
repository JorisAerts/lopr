import { defineComponent } from 'vue'

export const VSheet = defineComponent({
  name: 'v-sheet',

  setup(props, { attrs, slots }) {
    return () => (
      <div class={'v-sheet'} {...attrs}>
        {slots.default?.()}
      </div>
    )
  },
})
