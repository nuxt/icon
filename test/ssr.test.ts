import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, fetch, getServerLogs, setup } from '@nuxt/test-utils/e2e'
import { getCriticalJS } from './critical-js'

describe('SSR runtime icon loading', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/ssr-runtime', import.meta.url)),
    build: true,
    server: true,
    browser: false,
  })

  it('renders icons from the local server provider', async () => {
    const response = await fetch('/')
    const html = await response.text()

    expect(response.status).toBe(200)
    expect(html).toContain('class="iconify i-ph:acorn-bold"')
    expect(html).toContain('data:image/svg+xml')
    expect(getServerLogs().join('\n')).not.toContain('[Icon] failed to load icon')
  })

  it('keeps the Iconify runtime out of the critical client JS in css mode', async () => {
    const chunks = await getCriticalJS(await $fetch<string>('/'))

    expect(chunks.size).toBeGreaterThan(0)
    for (const code of chunks.values())
      expect(code).not.toContain('IconifyProviders')
  })
})
