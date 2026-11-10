import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { getCriticalJS } from './critical-js'

describe('svg mode', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/svg-mode', import.meta.url)),
    build: true,
    server: true,
    browser: false,
  })

  it('renders svg icons during SSR', async () => {
    const html = await $fetch<string>('/')
    expect(html).toMatch(/<svg[^>]+class="iconify iconify--ph"/)
  })

  it('puts each icon in the payload once, for hydration', async () => {
    const html = await $fetch<string>('/')
    expect(html.match(/<svg[^>]+class="iconify iconify--ph"/g)).toHaveLength(2)
    const payload = html.match(/<script[^>]+id="__NUXT_DATA__"[^>]*>([^<]*)<\/script>/)?.[1]
    expect(payload).toBeDefined()
    expect(payload!.split('"i-ph:acorn-bold"')).toHaveLength(2)
  })

  it('loads the svg component with the critical client JS', async () => {
    const chunks = await getCriticalJS(await $fetch<string>('/'))
    expect([...chunks.values()].some(code => code.includes('IconifyProviders'))).toBe(true)
  })
})
