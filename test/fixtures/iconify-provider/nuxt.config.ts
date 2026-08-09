import NuxtIcon from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    [NuxtIcon, {
      provider: 'iconify',
      serverBundle: false,
    }],
  ],
})
