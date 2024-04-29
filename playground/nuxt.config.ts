export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@unocss/nuxt',
  ],
  icon: {
    customCollections: [
      {
        prefix: 'custom1',
        dir: './icons/custom1',
      },
    ],
  },
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
