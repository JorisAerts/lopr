import type { PropType, Ref } from 'vue'
import { defineComponent, ref, watch } from 'vue'
import { VTab, VTabItem, VTabItems, VTable, VTabs } from '../../core'
import type { ProxyRequestInfo } from '../../../../shared/Request'
import type { UUID } from '../../../../shared/UUID'

export const RequestDetails = defineComponent({
  name: 'RequestDetails',

  props: {
    modelValue: { type: Object as PropType<ProxyRequestInfo> },
  },

  setup(props) {
    const currentTab = ref(0)
    const uuid: Ref<UUID | undefined> = ref()

    watch(
      props,
      (newValue) => {
        if (uuid.value !== newValue.modelValue?.uuid) currentTab.value = 0
        uuid.value = newValue.modelValue?.uuid
      },
      { immediate: true }
    )

    return () =>
      props.modelValue && (
        <>
          <VTabs v-model={currentTab.value}>
            <VTab name={'Request'} modelValue={0} />
            <VTab name={'Response'} modelValue={1} />
          </VTabs>

          <VTabItems modelValue={currentTab.value}>
            <VTabItem modelValue={0}>
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
            </VTabItem>
          </VTabItems>
        </>
      )
  },
})
