/// <reference types="vite/client" />
import { it, expect } from 'vitest'
import { IconUsageScanner } from '../src/scan'

it('extract icon usages', async () => {
  const code = await import('../playground/components/ShowcaseFixture.vue?raw').then(m => m.default)
  const set = new Set<string>()
  const context = new IconUsageScanner({})
  context.extractFromCode(code, set)

  expect(set).toMatchInlineSnapshot(`
    Set {
      "uil:github",
      "solar:medal-ribbon-bold-duotone",
      "uil:bad",
      "ph:code",
      "ph:table",
    }
  `)
})
