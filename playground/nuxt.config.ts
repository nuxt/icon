export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@unocss/nuxt',
    '@nuxt/test-utils/module',
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
    // serverBundle: {
    //   externalizeIconsJson: true,
    // },
    clientBundle: {
      icons: [
        'logos:vitejs',
        'ph:acorn-bold',
      ],
    },
  },

  nitro: {
    logLevel: 'verbose',
    // externals: {
    //   external: [
    //     (id) => {
    //       if (id.match(/(?:[\\/]|^)(@iconify-json[\\/]|@iconify[\\/]json)/)) {
    //         return true
    //       }
    //     },
    //   ],
    // },
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
