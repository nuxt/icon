import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: ['playground/**', 'node_modules/**'],
  },
})
