import 'js-proxy-ui/style'
import 'js-proxy-ui/components/Transition'

import { app } from './app'
import { useHtmlDarkMode } from 'js-proxy-ui'

useHtmlDarkMode()

export const container = document.body.appendChild(document.createElement('div'))
container.id = 'app'

app.mount(container)
