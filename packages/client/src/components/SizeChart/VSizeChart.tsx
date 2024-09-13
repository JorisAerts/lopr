import { defineComponent, ref, Transition, watch } from 'vue'
import { VBtn, VIcon, VLabel, VPieChart, VSheet } from 'lopr-ui'
import { toBytes } from '../../utils/to-bytes'
import { useAppStore } from '../../stores/app'
import { useRequestStore } from '../../stores/request'

export const VSizeChart = defineComponent({
  name: 'VSizeChart',

  setup() {
    const requestStore = useRequestStore()
    const appStore = useAppStore()
    const cachedSizes = ref()
    watch(
      () => appStore.sizes,
      () => appStore.sizes != null && (cachedSizes.value = { ...appStore.sizes, ...appStore.sizes.cacheSizes }),
      { immediate: true, deep: true }
    )
    return () => (
      <VSheet class={['d-flex', 'gap-4']}>
        <VPieChart values={Object.entries(cachedSizes.value ?? {}).map(([, value]) => ({ value: value as number }))} style={{ height: '75px' }} borderWidth={0.75} />
        <VSheet>
          <VSheet>
            <VLabel class={['d-inline']}>Certificates Size</VLabel>: <Transition>{toBytes(cachedSizes.value?.certSize)}</Transition>
          </VSheet>
          <VSheet>
            <VLabel class={['d-inline']}>Cache Size</VLabel>:
            {cachedSizes.value && Object.values(cachedSizes.value).length > 2 ? (
              <VSheet class={['d-flex', 'flex-column', 'gap-0']}>
                {Object.entries(cachedSizes.value ?? {})
                  .filter(([key]) => key !== 'certSize')
                  .map(([key, value]) => {
                    const isCurrent = key === `${appStore.port}`
                    return (
                      <VSheet>
                        <VLabel class={['d-inline']}>
                          <VIcon name="KeyboardArrowRight" /> {key}
                          {isCurrent && ' (current)'}
                        </VLabel>
                        : <Transition>{toBytes(value as number)}</Transition> <VBtn icon={'Delete'} transparent class={['pa-1']} onClick={() => requestStore.clear(key)} />
                      </VSheet>
                    )
                  })}
              </VSheet>
            ) : (
              <>
                {' '}
                <Transition>{toBytes(cachedSizes.value?.[`${appStore.port}`])}</Transition>
              </>
            )}
          </VSheet>
        </VSheet>
      </VSheet>
    )
  },
})
