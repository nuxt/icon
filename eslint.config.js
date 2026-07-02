// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: true,
  },
  dirs: {
    src: [
      './playgrounds/nuxt',
      './playgrounds/vite',
    ],
  },
})
  .prepend({
    ignores: [
      'src/collection-names.ts',
    ],
  })
