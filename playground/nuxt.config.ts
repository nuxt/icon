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
