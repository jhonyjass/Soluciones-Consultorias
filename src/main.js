import { createApp } from 'vue'
import { Quasar } from 'quasar'
import { createPinia } from 'pinia'
import quasarUserOptions from './quasar-user-options'
import App from './App.vue'
import router from './router'
import "src/css/site.scss";


const app = createApp(App)

// ⚡ Registrar Pinia antes de usar router
const pinia = createPinia()
app.use(pinia)
app.use(Quasar, quasarUserOptions)
app.use(router)

app.mount('#q-app')
