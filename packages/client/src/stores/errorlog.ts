import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { registerDataHandler } from '../utils/websocket'
import type { WebSocketMessage } from '../../../shared/src/WebSocketMessage'
import { WebSocketMessageType } from '../../../shared/src/WebSocketMessage'

export const STORE_NAME = 'Error Log'

type ErrorLog = {
  ts: Date
  key: number
  src: unknown
  err: Record<string, string>
}

export const useErrorLogStore = defineStore(STORE_NAME, () => {
  let counter = 0

  /**
   * A bunch of errors coming from the client
   */
  const errors = ref([] as ErrorLog[])

  // register the handlers (they will overwrite the previous ones)
  registerDataHandler(WebSocketMessageType.Error, ({ data }: WebSocketMessage<ErrorLog>) => {
    data.ts = new Date(data.ts)
    data.key = ++counter
    errors.value.push(data)
  })

  const hasErrors = computed(() => errors.value.length > 0)

  const clear = () => (errors.value = [])

  return { errors, hasErrors, clear }
})
