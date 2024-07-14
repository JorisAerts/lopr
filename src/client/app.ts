import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { router } from './router'
import { App } from './components'

import './utils/websocket'

export const app = createApp(App)

app.use(createPinia())
app.use(router)
