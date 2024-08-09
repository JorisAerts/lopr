import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { registerDataHandler } from '../utils/websocket'
import type { WebSocketMessage } from '../../shared/WebSocketMessage'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'

export const STORE_NAME = 'Error Log'

type ErrorLog = Record<string, string> & {
  ts: Date
}

export const useErrorLogStore = defineStore(STORE_NAME, () => {
  /**
   * A bunch of errors coming from the client
   */
  const errors = ref([] as ErrorLog[])

  // register the handlers (they will overwrite the previous ones)
  registerDataHandler(WebSocketMessageType.Error, ({ data }: WebSocketMessage<ErrorLog>) => {
    data.ts = new Date(data.ts)
    errors.value.push(data)
  })

  const hasErrors = computed(() => errors.value.length > 0)

  return { errors, hasErrors }
})
