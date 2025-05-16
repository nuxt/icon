import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    exclude: [
      '**/.DS_Store',
    ],
  },
})
