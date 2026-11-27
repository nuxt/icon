import Module from '../../../src/module'

export default defineNuxtConfig({
  modules: [Module],
  icon: {
    mode: 'svg',
    fallbackToApi: false,
    serverBundle: {
      collections: ['ph'],
    },
  },
})
