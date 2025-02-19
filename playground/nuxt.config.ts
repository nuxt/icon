export default defineNuxtConfig({

  extends: [
    './base',
  ],

  modules: [
    '../src/module',
    '@unocss/nuxt',
    '@nuxt/test-utils/module',
    '@nuxthub/core',
  ],

  imports: {
    autoImport: false,
  },

  devtools: {
    enabled: true,
  },

  compatibilityDate: '2024-07-18',

  nitro: {
    logLevel: 'verbose',
  },

  hub: {
    cache: true,
  },

  typescript: {
    includeWorkspace: true,
  },

  // ssr: false,

  icon: {
    generateTypes: false,
    customCollections: [
      {
        prefix: 'custom1',
        dir: './icons/custom1',
        normalizeIconName: false,
      },
      {
        prefix: 'custom-parts',
        dir: './icons/custom-parts',
        normalizeIconName: false,
      },
      {
        prefix: '',
        dir: './icons/no-prefix',
        normalizeIconName: false,
      },
    ],
    serverBundle: 'remote',
    fallbackToApi: 'server-only',
    // serverBundle: {
    //   externalizeIconsJson: true,
    // },
    clientBundle: {
      icons: [
        'logos:vitejs',
        'ph:acorn-bold',
      ],
      includeCustomCollections: true,
      scan: true,
    },
  },
})
