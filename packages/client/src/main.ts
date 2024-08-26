import 'js-proxy-ui/style'
import 'js-proxy-ui/components/Transition'

import { app } from './app'
import { useSystemDarkMode } from 'js-proxy-ui'
import { watch } from 'vue'

export const container = document.body.appendChild(document.createElement('div'))
container.id = 'app'

watch(
  useSystemDarkMode().isDark,
  (isDark) => {
    const html = document.querySelector('html') as HTMLElement
    if (isDark && !html.classList.contains('dark')) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  },
  { immediate: true }
)

app.mount(container)
