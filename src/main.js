import { createApp } from 'vue'
import App from './App.vue'
import Modal from './plugins/modal.js'
import style from './assets/styles/style.scss'

const app = createApp(App);
app.use(Modal)

app.mount('#app')
