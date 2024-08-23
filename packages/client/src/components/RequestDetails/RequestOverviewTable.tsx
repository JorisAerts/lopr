import { computed, defineComponent } from 'vue'
import { VTable } from 'js-proxy-ui/components'
import { useRequestStore } from '../../stores/request'
import { makeUUIDProps, useUUID } from '../../composables/uuid'

export const RequestOverviewTable = defineComponent({
  name: 'RequestOverviewTable',

  props: {
    ...makeUUIDProps(),
  },

  setup(props) {
    const uuid = useUUID(props)
    const requestStore = useRequestStore()
    const request = computed(() => (uuid.value ? requestStore.getRequest(uuid.value) : undefined))
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
            <tr>
              <th>URL:</th>
              <td>{request.value?.url}</td>
            </tr>

            {request.value?.ts != null && (
              <tr>
                <th>Time:</th>
                <td>{request.value.ts.toLocaleString()}</td>
              </tr>
            )}

            <tr>
              <th>Method:</th>
              <td>{request.value?.method}</td>
            </tr>

            {request.value?.statusCode != null && (
              <tr>
                <th>Status:</th>
                <td>{request.value?.statusCode}</td>
              </tr>
            )}

            {request.value?.headers.map(
              (h, i) =>
                i % 2 === 0 && (
                  <tr>
                    {i === 0 && <th rowspan={request.value!.headers.length / 2}>Headers:</th>}
                    <td>
                      <b>{h}</b>: {request.value!.headers[i + 1]}
                    </td>
                  </tr>
                )
            )}
          </tbody>
        </VTable>
      )
  },
})
