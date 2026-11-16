import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { createPage, setup, url } from '@nuxt/test-utils/e2e'

describe('svg mode hydration', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/svg-hydration', import.meta.url)),
    build: true,
    server: true,
    browser: true,
  })

  // the first request loads the icons, later ones render them from memory
  for (const request of ['first', 'later']) {
    it(`hydrates svg icons without mismatches (${request} request)`, async () => {
      const page = await createPage()
      const logs: string[] = []
      page.on('console', message => logs.push(message.text()))
      const response = await page.goto(url('/'), { waitUntil: 'networkidle' })
      const html = await response!.text()
      const ssrIcons = [...html.matchAll(/<svg[^>]*>/g)].map(m => m[0])
      expect(ssrIcons).toHaveLength(3)
      const ssrId = html.match(/id="probe" data-id="([^"]+)"/)?.[1]
      expect(ssrId).toBeDefined()

      await page.waitForFunction(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nuxtApp = (document.querySelector('#__nuxt') as any)?.__vue_app__?.config.globalProperties.$nuxt
        return nuxtApp && !nuxtApp.isHydrating
      })

      expect(logs.filter(log => /hydrat|mismatch/i.test(log))).toEqual([])
      // `useId` after the icons must match on both sides
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(await page.evaluate(() => (window as any).__probeId)).toBe(ssrId)
      expect(await page.$$eval('svg', icons => icons.map(icon => icon.getAttribute('class'))))
        .toEqual(ssrIcons.map(tag => tag.match(/class="([^"]*)"/)?.[1]))
      await page.close()
    })
  }
})
