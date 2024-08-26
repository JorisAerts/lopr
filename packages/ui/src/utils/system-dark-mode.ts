import { ref } from 'vue'
import { addDOMListener } from './addDOMListener'

export const useSystemDarkMode = () =>
  !window.matchMedia
    ? () => ({ isDark: ref(false) })
    : () => {
        const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')
        const isDark = ref(mediaQueryList.matches)
        addDOMListener(mediaQueryList, 'change', (event: MediaQueryListEvent) => (isDark.value = event.matches))
        return { isDark }
      }
