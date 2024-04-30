export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@unocss/nuxt',
  ],
  // ssr: false,
  icon: {
    customCollections: [
      {
        prefix: 'custom1',
        dir: './icons/custom1',
      },
    ],
  },
  nitro: {
    logLevel: 'verbose',
  },
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
