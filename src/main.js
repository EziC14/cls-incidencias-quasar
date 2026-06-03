import { createApp } from 'vue'
import { Quasar } from 'quasar'
import quasarLang from 'quasar/lang/es'
import quasarIconSet from 'quasar/icon-set/mdi-v7'
import router from './router'

import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/mdi-v7/mdi-v7.css'
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'
import 'quasar/src/css/index.sass'
import './css/app.scss'

import App from './App.vue'

const app = createApp(App)

app.use(Quasar, {
  plugins: {},
  lang: quasarLang,
  iconSet: quasarIconSet,
  config: {
    dark: false
  }
})
app.use(router)
app.mount('#q-app')
