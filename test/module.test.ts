import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { setup, useTestContext } from '@nuxt/test-utils/e2e'

describe('module', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/iconify-provider', import.meta.url)),
    build: true,
    server: false,
  })

  it('does not register the local API handler for the iconify provider', () => {
    const handlers = useTestContext().nuxt?.options.serverHandlers

    expect(handlers).not.toContainEqual(expect.objectContaining({
      route: '/api/_nuxt_icon/:collection',
    }))
  })
})
