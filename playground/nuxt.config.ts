export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@unocss/nuxt',
  ],
  // ssr: false,
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
