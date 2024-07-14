import { createApp, defineAsyncComponent } from 'vue'
import { createPinia } from 'pinia'
import { router } from './router'
import './utils/websocket'
import { useRequestStore } from './stores/request'
import { usePreferencesStore } from './stores/preferences'
import { useErrorLogStore } from './stores/errorlog'
import { useCertificateStore } from './stores/certificates'

// split the ui in another chunk
const App = defineAsyncComponent(() => import('./components/app/App').then((c) => c.App))

export const app = createApp(App)
app.use(createPinia())
app.use(router)

// init stores that automagically will register web socket handlers
// should be extracted
useRequestStore()
usePreferencesStore()
useErrorLogStore()
useCertificateStore()
