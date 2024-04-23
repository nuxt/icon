export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@unocss/nuxt',
  ],
  devtools: {
    enabled: true,
  },
  typescript: {
    includeWorkspace: true,
  },
  imports: {
    autoImport: false,
  },
})
