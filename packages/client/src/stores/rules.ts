import { defineStore } from 'pinia'
import { ref } from 'vue'

export const STORE_NAME = 'Rules'

export const useRulesStore = defineStore(STORE_NAME, () => {
  const rules = ref([])

  return { rules }
})
