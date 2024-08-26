import type { Ref } from 'vue'
import { ref, watchEffect } from 'vue'
import { addDOMListener } from './addDOMListener'

export interface SystemDarkMode {
  isDark: Ref<boolean>
}

export type UseSystemDarkMode = () => SystemDarkMode

const HTML_DARK_MODE_CLASS = 'dark-mode'

export const useSystemDarkMode = ((): UseSystemDarkMode =>
  !window.matchMedia
    ? () => ({ isDark: ref(false) })
    : () => {
        const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')
        const isDark = ref(mediaQueryList.matches)
        addDOMListener(mediaQueryList, 'change', (event: MediaQueryListEvent) => (isDark.value = event.matches))
        return { isDark }
      })()

export const useHtmlDarkMode = () =>
  watchEffect(() => {
    const html = document.querySelector('html') as HTMLElement
    if (useSystemDarkMode().isDark && !html.classList.contains(HTML_DARK_MODE_CLASS)) {
      html.classList.add(HTML_DARK_MODE_CLASS)
    } else {
      html.classList.remove(HTML_DARK_MODE_CLASS)
    }
  })
