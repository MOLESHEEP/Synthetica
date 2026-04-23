/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

console.log('正在初始化应用...')

const app = createApp(App)

registerPlugins(app)

app.mount('#app')

console.log('应用已挂载到 #app')
