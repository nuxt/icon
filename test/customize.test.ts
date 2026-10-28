import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, createPage, setup, url } from '@nuxt/test-utils/e2e'

describe('customized css icons', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/customize', import.meta.url)),
    build: true,
    server: true,
    browser: true,
  })

  it('hydrates customized icons with the class rendered during SSR', async () => {
    const html = await $fetch<string>('/')
    const ssrClasses = [...html.matchAll(/class="(iconify i-ph:[\w-]+--customized-[^"]+)"/g)].map(m => m[1]!)
    expect(ssrClasses).toHaveLength(2)
    const [thinClass, boldClass] = ssrClasses

    const page = await createPage()
    await page.goto(url('/'), { waitUntil: 'networkidle' })
    await page.waitForFunction(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nuxtApp = (document.querySelector('#__nuxt') as any)?.__vue_app__?.config.globalProperties.$nuxt
      return nuxtApp && !nuxtApp.isHydrating
    })
    await page.hover('#lazy .iconify')
    await page.waitForLoadState('networkidle')

    expect(await page.$$eval('.iconify', icons => icons.map(icon => icon.getAttribute('class'))))
      .toEqual([thinClass, thinClass, boldClass])

    const ssrHashes = ssrClasses.map(c => c.split('--customized-')[1]!)
    const customizedRules = await page.$$eval('style', styles => styles
      .map(style => style.textContent || '')
      .filter(css => css.includes('--customized-')))
    expect(customizedRules.length).toBeGreaterThan(0)
    for (const css of customizedRules) {
      for (const [, hash] of css.matchAll(/--customized-([\w-]+)/g))
        expect(ssrHashes).toContain(hash)
    }
    await page.close()
  })
})
