import { defineStore } from 'pinia'
import { computed, ref, triggerRef } from 'vue'

export const STORE_NAME = 'Application'

export const useAppStore = defineStore(STORE_NAME, () => {
  // "Wrap" in the response body view
  const wrapResponseData = ref(false)
  const fetching = ref(false)

  // the size of the cache and certificates and such
  const port = ref()
  const sizes = ref()

  const refresh = (retry = 0) => {
    if (retry > 5) {
      fetching.value = false
      return
    }
    fetching.value = true
    try {
      fetch('/api/server-info')
        .then((res) => {
          if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
          else return res
        })
        .then((res) => res.json())
        .then((s) => {
          port.value = s.port
          sizes.value = s.sizes
        })
        .catch(() => {
          fetching.value = false
          refresh(++retry)
        })
        .then(() => (fetching.value = false))
    } catch {
      refresh(++retry)
    }
  }

  const computedSizes = computed({
    get: () => {
      if (sizes.value === undefined && !fetching.value) refresh()
      return sizes.value
    },
    set: () => refresh(),
  })

  const clear = () => {
    sizes.value = undefined
    triggerRef(fetching)
    triggerRef(sizes)
  }

  return {
    clear,
    wrapResponseData,
    port,
    sizes: computedSizes,

    fetching: computed(() => fetching.value),
  }
})
