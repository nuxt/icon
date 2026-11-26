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

  it('renders the ids inside icons the same way on every request', async () => {
    const first = await $fetch<string>('/')
    expect(await $fetch<string>('/')).toBe(first)
    const icons = first.match(/<svg[^>]+class="iconify iconify--custom"[\s\S]*?<\/svg>/g)!
    expect(icons).toHaveLength(2)
    const ids = icons.map(svg => svg.match(/<linearGradient id='([^']+)'/)![1]!)
    // unique per icon, and each icon refers to its own gradient
    expect(new Set(ids).size).toBe(2)
    icons.forEach((svg, i) => expect(svg).toContain(`fill="url(#${ids[i]})"`))
  })

  it('loads the svg component with the critical client JS', async () => {
    const chunks = await getCriticalJS(await $fetch<string>('/'))
    expect([...chunks.values()].some(code => code.includes('IconifyProviders'))).toBe(true)
  })
})
