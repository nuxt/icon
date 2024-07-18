export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@unocss/nuxt',
  ],

  extends: [
    './base',
  ],

  // ssr: false,
  icon: {
    customCollections: [
      {
        prefix: 'custom1',
        dir: './icons/custom1',
      },
    ],
    serverBundle: 'remote',
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

  compatibilityDate: '2024-07-18',
})
