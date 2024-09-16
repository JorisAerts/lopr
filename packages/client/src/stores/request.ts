import { defineStore } from 'pinia'
import type { UUID } from 'lopr-shared'
import type { Ref } from 'vue'
import { ref } from 'vue'
import type { StructNode } from './cache'

export const STORE_NAME = 'Requests'

export const useRequestStore = defineStore(STORE_NAME, () => {
  /**
   * The currently selected UUID (request/response)
   */
  const current: Ref<UUID | undefined> = ref()

  /**
   * The currently selected UUID (request/response)
   */
  const filter: Ref<string | undefined> = ref()

  /**
   * Structured tree-view of the requests
   */
  const structure = ref<StructNode>({ key: '', isNew: false })

  //

  return { current, structure, filter }
})
