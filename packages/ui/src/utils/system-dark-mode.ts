import type { Ref } from 'vue'
import { ref } from 'vue'

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
        const handleToggleDarkMode = (event: MediaQueryListEvent) => (isDark.value = event.matches)
        // no removeEventListener, it never expires within the lifecycle of the page
        mediaQueryList.addEventListener('change', handleToggleDarkMode)
        return { isDark }
      })()
