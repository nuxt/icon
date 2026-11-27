import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, fetch, setup } from '@nuxt/test-utils/e2e'

describe('Nuxt 5', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/nuxt5', import.meta.url)),
    build: true,
    server: true,
    browser: false,
    // The fixture's iconifyApiEndpoint points at its own server on this port
    port: 34615,
  })

  it('renders icons from the server bundle', async () => {
    const response = await fetch('/')
    const html = await response.text()

    expect(response.status).toBe(200)
    expect(html).toContain('class="iconify i-ph:acorn-bold"')
    expect(html).toContain('data:image/svg+xml')
  })

  it('serves bundled collections from the icon API', async () => {
    const data = await $fetch<{ prefix: string, icons: Record<string, unknown> }>('/api/_nuxt_icon/ph.json?icons=acorn-bold')

    expect(data.prefix).toBe('ph')
    expect(data.icons['acorn-bold']).toBeTruthy()
  })

  it('falls back to the Iconify API on the server', async () => {
    const data = await $fetch<{ prefix: string, icons: Record<string, unknown> }>('/api/_nuxt_icon/remote.json?icons=remote')

    expect(data.prefix).toBe('remote')
    expect(data.icons.remote).toBeTruthy()
  })
})
