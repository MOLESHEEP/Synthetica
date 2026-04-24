/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Composables
import { createApp } from 'vue'
// Plugins
import { registerPlugins } from '@/plugins'
import { createPinia } from 'pinia'
// Components
import App from './App.vue'
import vuetify from './plugins/vuetify'

console.log('正在初始化应用...')
const app = createApp(App)
registerPlugins(app)
app.use(createPinia())
app.use(vuetify)
app.mount('#app')
console.log('应用已挂载到 #app')
