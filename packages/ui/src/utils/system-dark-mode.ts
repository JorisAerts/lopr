import type { Ref } from 'vue'
import { ref } from 'vue'
import { addDOMListener } from './addDOMListener'

export interface SystemDarkMode {
  isDark: Ref<boolean>
}

export type UseSystemDarkMode = () => SystemDarkMode

export const useSystemDarkMode = ((): UseSystemDarkMode =>
  !window.matchMedia
    ? () => ({ isDark: ref(false) })
    : () => {
        const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')
        const isDark = ref(mediaQueryList.matches)
        addDOMListener(mediaQueryList, 'change', (event: MediaQueryListEvent) => (isDark.value = event.matches))
        return { isDark }
      })()
