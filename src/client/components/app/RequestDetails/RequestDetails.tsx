import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import { VTab, VTable, VTabs } from '../../core'
import type { ProxyRequestInfo } from '../../../../shared/Request'

export const RequestDetails = defineComponent({
  name: 'RequestDetails',

  props: {
    modelValue: { type: Object as PropType<ProxyRequestInfo> },
  },

  setup(props) {
    return () =>
      props.modelValue && (
        <>
          <VTabs>
            <VTab name={'Request'} />
            <VTab name={'Response'} />
          </VTabs>

          <VTable class={'gap-2'}>
            <thead>
              <tr>
                <th style={{ width: '140px' }}>Name</th>
                <th>Value</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <th>URL:</th>
                <td>{props.modelValue.url}</td>
              </tr>

              {props.modelValue.ts != null && (
                <tr>
                  <th>Time:</th>
                  <td>{props.modelValue.ts.toLocaleString()}</td>
                </tr>
              )}

              <tr>
                <th>Method:</th>
                <td>{props.modelValue.method}</td>
              </tr>

              {props.modelValue.statusCode != null && (
                <tr>
                  <th>Status:</th>
                  <td>{props.modelValue.statusCode}</td>
                </tr>
              )}

              {props.modelValue.headers.map(
                (h, i) =>
                  i % 2 === 0 && (
                    <tr>
                      {i === 0 && <th rowspan={props.modelValue!.headers.length / 2}>Headers:</th>}
                      <td>
                        <b>{h}</b>: {props.modelValue!.headers[i + 1]}
                      </td>
                    </tr>
                  )
              )}
            </tbody>
          </VTable>
        </>
      )
  },
})
