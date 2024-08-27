import { onMounted, onUnmounted } from 'vue'

type Listener = (...args: any[]) => any

export const addDOMListener = (el: EventTarget, event: string, cb: Listener, options?: AddEventListenerOptions & { onMounted: boolean }) => {
  const listen = () => el.addEventListener(event, cb, options)
  if (options?.onMounted === true) onMounted(listen)
  else listen()
  onUnmounted(() => el.removeEventListener(event, cb, options))
}

export const addDOMListenerOnMounted = (el: EventTarget, event: string, cb: Listener, options?: AddEventListenerOptions & { onMounted: boolean }) =>
  addDOMListener(el, event, cb, { ...options, onMounted: true })
