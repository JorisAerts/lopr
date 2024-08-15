import { ref, watch } from 'vue'

const prefix = `js-proxy.`

const getJSON = (key: string, defaultValue = undefined) => {
  const value = localStorage.getItem(`${prefix}prefs`)
  return null == value ? defaultValue : JSON.parse(value)
}

const setJSON = <Value>(key: string, value: Value) =>
  null == value //
    ? localStorage.removeItem(`${prefix}${key}`)
    : localStorage.setItem(`${prefix}${key}`, JSON.stringify(value))

export const useLocalStorage = () => {
  const prefs = ref(getJSON('prefs'))
  // update the local store when the props change
  watch(prefs, () => setJSON('prefs', prefs.value), { deep: true })

  return { prefs }
}
