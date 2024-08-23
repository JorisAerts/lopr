import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import { VTable } from 'js-proxy-ui/components'

export const HeadersTable = defineComponent({
  name: 'HeadersTable',

  props: {
    modelValue: { type: Array as PropType<string[]> },
  },

  setup(props, { slots }) {
    return () =>
      props.modelValue && (
        <VTable class={'gap-2'}>
          <thead>
            <tr>
              <th style={{ width: '140px' }}>Name</th>
              <th>Value</th>
            </tr>
          </thead>

          <tbody>
            {props.modelValue.map(
              (h, i) =>
                i % 2 === 0 && (
                  <tr>
                    <th>{h}</th>
                    <td>{slots[`header:${h}`]?.(props.modelValue![i + 1]) ?? props.modelValue![i + 1]}</td>
                  </tr>
                )
            )}
          </tbody>
        </VTable>
      )
  },
})
