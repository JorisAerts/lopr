import type { PropType, Ref } from 'vue'
import { computed, defineComponent, shallowRef } from 'vue'
import { VCard, VContainer, VList, VListItem, VTable } from '../components'
import { useRequestStore } from '../stores/request'
import type { ProxyRequest } from '../../shared/Request'

export const Sequence = defineComponent({
  name: 'v-home-view',

  props: {
    width: {
      type: [Number, String] as PropType<number | string>,
      default: 320,
    },
  },

  setup(props) {
    const requestStore = useRequestStore()
    const current: Ref<ProxyRequest | undefined> = shallowRef()

    const width = computed(() =>
      typeof props.width === 'number' ? `${props.width}px` : props.width
    )

    const handleSelect = (item: ProxyRequest) => {
      current.value = item
    }

    return () => (
      <VContainer class={['fill-height', 'gap-2']}>
        <VCard
          class={['fill-height', 'py-2', 'd-flex', 'flex-column']}
          style={{
            width: width.value,
            'max-width': width.value,
          }}
        >
          <h3 class={'px-3'}>Requests</h3>
          <VList class={['fill-height', 'overflow-auto', 'mt-2']}>
            {requestStore.requests.map((req) => (
              <VListItem
                onClick={() => handleSelect(req)}
                class={['py-0', 'mx-1', 'px-1', 'overflow-ellipsis']}
                prependIcon={'InputCircle'}
              >
                <div
                  class={['no-wrap', 'overflow-hidden', 'overflow-ellipsis']}
                >
                  {req.method} — {req.url}
                </div>
              </VListItem>
            ))}
          </VList>
        </VCard>

        <VCard class={['fill-height', 'overflow-auto', 'flex-grow-1', 'pa-3']}>
          {current.value && (
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
                  <td>{current.value.url}</td>
                </tr>

                {current.value.ts != null && (
                  <tr>
                    <th>Time:</th>
                    <td>{current.value.ts.toLocaleString()}</td>
                  </tr>
                )}

                <tr>
                  <th>Method:</th>
                  <td>{current.value.method}</td>
                </tr>

                {current.value.statusCode != null && (
                  <tr>
                    <th>Status:</th>
                    <td>{current.value.statusCode}</td>
                  </tr>
                )}

                {current.value.headers.map(
                  (h, i) =>
                    i % 2 === 0 && (
                      <tr>
                        {i === 0 && (
                          <th rowspan={current.value!.headers.length / 2}>
                            Headers:
                          </th>
                        )}
                        <td>
                          <b>{h}</b>: {current.value!.headers[i + 1]}
                        </td>
                      </tr>
                    )
                )}
              </tbody>
            </VTable>
          )}
        </VCard>
      </VContainer>
    )
  },
})
