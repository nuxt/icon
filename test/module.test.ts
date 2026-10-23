import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { loadNuxt } from '@nuxt/kit'
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

describe('module setup', () => {
  it('throws for an object provider without both sides', async () => {
    const nuxt = loadNuxt({
      // A fixture without `provider`, so the partial object is not merged with another one
      cwd: fileURLToPath(new URL('./fixtures/ssr-runtime', import.meta.url)),
      dev: false,
      overrides: {
        // @ts-expect-error `server` is required
        icon: { provider: { client: 'iconify' } },
      },
    })

    await expect(nuxt).rejects.toThrow('`icon.provider` object must define both `server` and `client`')
  })
})
