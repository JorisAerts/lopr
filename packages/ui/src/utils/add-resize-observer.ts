import type { Ref } from 'vue'
import { isRef, onMounted, onUnmounted, watch } from 'vue'

export const addResizeObserver = (el: Element | Ref<Element>, cb: ResizeObserverCallback) => {
  if (!el) return {}
  if (isRef(el)) return addRefResizeObserver(el, cb)

  const ob = new ResizeObserver(cb)
  let observing = false
  const observe = () => !!(!observing && ob.observe(el))
  const unobserve = () => {
    if (observing) ob.unobserve(el)
    observing = false
  }
  onMounted(observe)
  onUnmounted(unobserve)
  return { observe, unobserve }
}

export const addRefResizeObserver = (el: Ref<Element>, cb: ResizeObserverCallback) => {
  const ob = new ResizeObserver(cb)
  let observing = false
  let current: Element | undefined = undefined
  const observe = () => {
    if (observing) return
    if (current) ob.unobserve(current)
    if ((observing = !!(current = el.value))) ob.observe(current)
  }
  const unobserve = () => {
    if (observing && current) ob.unobserve(current)
    current = undefined
    observing = false
  }
  watch(el, () => {
    if (observing) {
      unobserve()
      observe()
    }
  })
  onMounted(observe)
  onUnmounted(unobserve)
  return { observe, unobserve }
}
