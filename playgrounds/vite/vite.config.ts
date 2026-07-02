import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { NuxtIconBundle } from '../../src/vite'

export default defineConfig({
  plugins: [
    vue(),
    NuxtIconBundle({
      // Explicitly bundled icons (hard-fail the build when not installed locally)
      icons: ['uil:github'],
      // `scan: true` is the default: literal icon usages in the source files
      // below are bundled automatically
      customCollections: [
        {
          prefix: 'custom',
          dir: 'icons',
        },
      ],
    }),
  ],
})
