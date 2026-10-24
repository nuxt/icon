import { defineConfig } from 'vitest/config'

export default defineConfig({
  define: {
    'import.meta.client': 'true',
  },
  test: {
    exclude: ['playgrounds/**', 'node_modules/**'],
  },
})
