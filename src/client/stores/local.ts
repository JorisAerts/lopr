import { defineStore } from 'pinia'
import { packageJson } from '../../node/utils/package'
import { computed } from 'vue'

export const STORE_NAME = 'Local Storage'

const prefix = `${packageJson.name}.`

const getJSON = (key: string, defaultValue = undefined) => {
  const value = localStorage.getItem(`${prefix}prefs`)
  return null == value ? defaultValue : JSON.parse(value)
}

const setJSON = <Value>(key: string, value: Value) =>
  null == value //
    ? localStorage.removeItem(`${prefix}${key}`)
    : localStorage.setItem(`${prefix}${key}`, JSON.stringify(value))

export const useLocalStore = defineStore(STORE_NAME, () => {
  const prefs = computed<Record<string, any>>({
    get: () => getJSON('prefs'),
    set: (value) => setJSON('prefs', value),
  })

  const sslProxy = computed<boolean>({
    get: () => !!prefs.value?.sslProxy,
    set: (value) => (prefs.value = { ...prefs.value, sslProxy: value }),
  })

  return { sslProxy }
})
