import Module from '../../src/module'

// Nuxt 4 builds on Nitro 3 because this playground installs `nitro`.
export default defineNuxtConfig({
  modules: [Module],
  imports: {
    autoImport: false,
  },
  compatibilityDate: '2026-06-10',
  icon: {
    serverBundle: {
      collections: ['ph'],
      externalizeIconsJson: true,
    },
  },
})
