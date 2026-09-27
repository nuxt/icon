import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, fetch, getServerLogs, setup } from '@nuxt/test-utils/e2e'

describe('split server/client provider', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/split-provider', import.meta.url)),
    build: true,
    server: true,
    browser: false,
  })

  it('renders icons during SSR from the local server provider', async () => {
    const response = await fetch('/')
    const html = await response.text()

    expect(response.status).toBe(200)
    // Rendered by <Icon> regardless of whether the icon data was loaded
    expect(html).toContain('class="iconify i-ph:acorn-bold"')
    // The actual proof: the SVG data was resolved during SSR, and the Iconify API endpoint is unreachable
    expect(html).toContain('data:image/svg+xml')
    expect(getServerLogs().join('\n')).not.toContain('[Icon] failed to load icon')
  })

  it('exposes the normalized provider to the runtime', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('{&quot;server&quot;:&quot;server&quot;,&quot;client&quot;:&quot;iconify&quot;}')
  })

  it('registers the local endpoint with the server bundle', async () => {
    const data = await $fetch<{ prefix: string, icons: Record<string, unknown> }>('/api/_nuxt_icon/ph.json?icons=acorn-bold')
    expect(data.prefix).toBe('ph')
    expect(data.icons['acorn-bold']).toBeTruthy()
  })
})
