import nuxtIcon from '../src/module'

export default defineNuxtConfig({
  typescript: { strict: true, includeWorkspace: true },
  modules: [
    '@nuxt/devtools',
    nuxtIcon,
  ],
})
