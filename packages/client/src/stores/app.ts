import { defineStore } from 'pinia'
import { computed, ref, triggerRef } from 'vue'

export const STORE_NAME = 'Application'

export const useAppStore = defineStore(STORE_NAME, () => {
  // "Wrap" in the response body view
  const wrapResponseData = ref(false)
  const fetching = ref(false)

  // the size of the cache and certificates and such
  const sizes = ref()

  const refresh = (retry = 0) => {
    fetching.value = true
    fetch('/api/server-info')
      .then((res) => res.json())
      .then((s) => (sizes.value = s))
      .catch(() => {
        fetching.value = false
        if (retry < 5) refresh(++retry)
      })
      .then(() => (fetching.value = false))
  }

  const computedSizes = computed({
    get: () => {
      if (sizes.value === undefined) refresh()
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
    sizes: computedSizes,
  }
})
