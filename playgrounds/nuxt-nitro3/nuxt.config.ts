import Module from '../../src/module'

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
    fallbackToApi: false,
  },
})
