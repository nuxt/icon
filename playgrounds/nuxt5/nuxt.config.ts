import Module from '../../src/module'

export default defineNuxtConfig({
  modules: [Module],
  imports: {
    autoImport: false,
  },
  future: {
    compatibilityVersion: 5,
  },
  compatibilityDate: '2026-06-10',
  icon: {
    serverBundle: {
      collections: ['ph'],
    },
  },
})
