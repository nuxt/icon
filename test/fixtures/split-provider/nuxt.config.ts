import Module from '../../../src/module'

export default defineNuxtConfig({
  modules: [Module],
  icon: {
    provider: { server: 'server', client: 'iconify' },
    // Unreachable on purpose: SSR must not use the Iconify API
    iconifyApiEndpoint: 'http://127.0.0.1:1/',
    fallbackToApi: false,
    serverBundle: {
      collections: ['ph'],
    },
  },
})
