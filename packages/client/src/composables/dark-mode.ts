import { useSystemDarkMode } from 'lopr-ui'
import { watchEffect } from 'vue'
import { bindLocalStorage } from './localStorage'

const HTML_DARK_MODE_CLASS = 'dark-mode'

export const useDarkMode = () => {
  const isDark = bindLocalStorage('dark-mode')

  if (isDark.value === undefined) isDark.value = useSystemDarkMode().isDark.value

  watchEffect(() => {
    const html = document.querySelector('html') as HTMLElement
    const hasDarkClass = html.classList.contains(HTML_DARK_MODE_CLASS)

    if (isDark.value) {
      if (!hasDarkClass) html.classList.add(HTML_DARK_MODE_CLASS)
    } else {
      if (hasDarkClass) html.classList.remove(HTML_DARK_MODE_CLASS)
    }
  })

  return { isDark }
}

export type UseDarkMode = ReturnType<typeof useDarkMode>

export const useHtmlDarkMode = () =>
  watchEffect(() => {
    const html = document.querySelector('html') as HTMLElement
    if (useSystemDarkMode().isDark && !html.classList.contains(HTML_DARK_MODE_CLASS)) {
      html.classList.add(HTML_DARK_MODE_CLASS)
    } else {
      html.classList.remove(HTML_DARK_MODE_CLASS)
    }
  })
