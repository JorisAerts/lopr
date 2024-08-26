import { onUnmounted } from 'vue'

type Listener = (...args: any[]) => any

export const addDOMListener = (el: EventTarget, event: string, cb: Listener, options?: AddEventListenerOptions) => {
  el.addEventListener(event, cb, options)
  onUnmounted(() => el.removeEventListener(event, cb, options))
}
