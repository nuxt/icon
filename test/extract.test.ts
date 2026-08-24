/// <reference types="vite/client" />
import { it, expect } from 'vitest'
import { IconUsageScanner } from '../src/core/scan'

it('extract icon usages', async () => {
  const code = await import('../playgrounds/nuxt/components/ShowcaseFixture.vue?raw').then(m => m.default)
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

function extract(code: string) {
  const set = new Set<string>()
  new IconUsageScanner({}).extractFromCode(code, set)
  return [...set]
}

it('extracts every supported way of writing an icon name', () => {
  expect(extract('<Icon name="mdi:home" />')).toEqual(['mdi:home'])
  expect(extract('<Icon name="mdi-home" />')).toEqual(['mdi:home'])
  expect(extract('<div class="i-mdi-home" />')).toEqual(['mdi:home'])
  expect(extract('<div class="i-mdi:home" />')).toEqual(['mdi:home'])
  expect(extract('<div class="dark:i-mdi-home" />')).toEqual(['mdi:home'])
  // A collection whose own name contains a `-`, and a name with digits
  expect(extract('<Icon name="mdi-light:home" />')).toEqual(['mdi-light:home'])
  expect(extract('<Icon name="uil:0-plus" />')).toEqual(['uil:0-plus'])
  // The form the playground uses
  expect(extract(`icon: 'logos-nuxt-icon'`)).toEqual(['logos:nuxt-icon'])
})

it('does not extract from the middle of a longer identifier', () => {
  // `map`, `vs` and `ix` are collection prefixes, but none of these is a usage
  expect(extract(`import 'source-map-js'`)).toEqual([])
  expect(extract('see undici-vs-builtin-fetch.md')).toEqual([])
  expect(extract('<img src="https://images.example.com/n-ix-ltd/logo.png">')).toEqual([])
  // A CSS custom property, not the `gg` collection
  expect(extract('<div style="--gg-size: 4px" />')).toEqual([])
})

it('never extracts a name that Iconify could not accept', () => {
  // `memory` is a collection prefix; the old pattern captured `efficient-`,
  // trailing `-` and all, because the uppercase `L` closed the word boundary
  expect(extract('Fast-memory-efficient-Levenshtein')).toEqual([])
  expect(extract('<Icon name="mdi--home" />')).toEqual([])
  for (const name of extract('<Icon name="mdi:home" /> <Icon name="mdi-light:home" />'))
    expect(name.split(':')[1]).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
})
