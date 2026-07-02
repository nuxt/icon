import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: ['playground/**', 'playground-vite/**', 'node_modules/**'],
  },
})
