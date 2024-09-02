import { computed, ref, watch } from 'vue'

const prefix = `lopr.`

const getJSON = (key: string, defaultValue: any = undefined) => {
  const value = localStorage.getItem(`${prefix}${key}`)
  return null == value ? defaultValue : JSON.parse(value)
}

const setJSON = <Value>(key: string, value: Value) =>
  null == value //
    ? localStorage.removeItem(`${prefix}${key}`)
    : localStorage.setItem(`${prefix}${key}`, JSON.stringify(value))

export const useLocalStorage = () => {
  const prefs = ref(getJSON('prefs', {}))
  // update the local store when the props change
  watch(prefs, () => setJSON('prefs', prefs.value), { deep: true })

  return { prefs }
}

export const bindLocalStorage = (key: keyof ReturnType<typeof useLocalStorage>['prefs']['value']) => {
  const localStore = useLocalStorage()
  return computed<boolean>({
    get: () => localStore.prefs.value[key],
    set: (value) => (localStore.prefs.value[key] = value),
  })
}
