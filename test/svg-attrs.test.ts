import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, createPage, setup, url } from '@nuxt/test-utils/e2e'

/** The two `<svg>` of each case: the first renders directly, the second through `<NuxtIconSvg>` */
function pairs(html: string) {
  return [...html.matchAll(/<div data-case="([^"]+)">(.*?)<\/div>/gs)]
    .map(([, name, content]) => ({ name, icons: content!.match(/<svg.*?<\/svg>/gs) }))
}

describe('svg mode attributes', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/svg-attrs', import.meta.url)),
    build: true,
    server: true,
    browser: true,
  })

  it('renders the same <svg> as <NuxtIconSvg> for Iconify customisations', async () => {
    // the first request loads the icons, the second renders them from memory
    await $fetch<string>('/')
    const cases = pairs(await $fetch<string>('/'))
    expect(cases).toHaveLength(9)
    for (const { name, icons } of cases) {
      expect(icons, name).toHaveLength(2)
      expect(icons![0], name).toBe(icons![1])
    }
    const [width] = cases.find(c => c.name === 'width')!.icons!
    expect(width).toContain('width="48" height="48"')
    expect(cases.find(c => c.name === 'rotate')!.icons![0]).toContain('rotate(90')
  })

  it('hydrates them without mismatches', async () => {
    const page = await createPage()
    const logs: string[] = []
    page.on('console', message => logs.push(message.text()))
    const response = await page.goto(url('/'), { waitUntil: 'networkidle' })
    const html = await response!.text()
    await page.waitForFunction(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nuxtApp = (document.querySelector('#__nuxt') as any)?.__vue_app__?.config.globalProperties.$nuxt
      return nuxtApp && !nuxtApp.isHydrating
    })
    expect(logs.filter(log => /hydrat|mismatch/i.test(log))).toEqual([])
    const hydrated = await page.$$eval('[data-case]', cases => cases.map(c => [...c.querySelectorAll('svg')].map(svg => svg.outerHTML)))
    for (const icons of hydrated)
      expect(icons[0]).toBe(icons[1])
    expect(hydrated).toHaveLength(pairs(html).length)
    await page.close()
  })
})
