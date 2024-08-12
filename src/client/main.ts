import './style/main.scss'
import './components/core/Transition'

import { app } from './app'

export const container = document.body.appendChild(document.createElement('div'))
container.id = 'app'

app.mount(container)
