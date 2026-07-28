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
    iconifyApiEndpoint: 'http://127.0.0.1:34615/iconify/',
    fallbackToApi: 'server-only',
    serverBundle: {
      collections: ['ph'],
    },
  },
})
