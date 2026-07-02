// Registers the pre-bundled icons on `@iconify/vue`, so they render
// synchronously and offline, without requests to the Iconify API
import 'virtual:nuxt-icon-bundle/register'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
