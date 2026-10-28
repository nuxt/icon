import Module from '../../../src/module'

export default defineNuxtConfig({
  modules: [Module],
  icon: {
    fallbackToApi: false,
    serverBundle: {
      collections: ['ph'],
    },
  },
})
