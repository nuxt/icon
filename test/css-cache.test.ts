import { beforeEach, expect, it, vi } from 'vitest'
import type { IconifyIcon } from '@iconify/types'

vi.mock('@iconify/utils/lib/css/icon', async (importOriginal) => {
  const original = await importOriginal<typeof import('@iconify/utils/lib/css/icon')>()
  return { getIconCSS: vi.fn(original.getIconCSS) }
})

const { getIconCSS: uncached } = await vi.importActual<typeof import('@iconify/utils/lib/css/icon')>('@iconify/utils/lib/css/icon')

let getIconCSS: typeof uncached
let getCachedIconCSS: typeof import('../src/runtime/components/css-cache').getCachedIconCSS

beforeEach(async () => {
  vi.resetModules()
  getIconCSS = (await import('@iconify/utils/lib/css/icon')).getIconCSS
  getCachedIconCSS = (await import('../src/runtime/components/css-cache')).getCachedIconCSS
  vi.mocked(getIconCSS).mockClear()
})

const icon: IconifyIcon = { body: '<path fill="currentColor" d="M0 0h24v24H0z"/>', width: 24, height: 24 }

it('returns the same CSS as `getIconCSS`', () => {
  const expected = uncached(icon, { iconSelector: '.i-a', format: 'compressed' })
  expect(getCachedIconCSS(icon, '.i-a')).toBe(expected)
  expect(getCachedIconCSS(icon, '.i-a')).toBe(expected)
  expect(getIconCSS).toHaveBeenCalledTimes(1)
})

it('generates CSS per selector', () => {
  expect(getCachedIconCSS(icon, '.i-a')).toContain('.i-a{')
  expect(getCachedIconCSS(icon, ':where(.i-a)')).toContain(':where(.i-a){')
  expect(getIconCSS).toHaveBeenCalledTimes(2)
})

it('regenerates CSS when the icon data changes', () => {
  const css = getCachedIconCSS(icon, '.i-a')
  expect(getCachedIconCSS({ ...icon, width: 16 }, '.i-a')).not.toBe(css)
  expect(getCachedIconCSS({ ...icon, hFlip: true }, '.i-a')).not.toBe(css)
  expect(getCachedIconCSS({ ...icon }, '.i-a')).toBe(css)
  expect(getIconCSS).toHaveBeenCalledTimes(4)
})

it('is not affected by mutating the icon after caching', () => {
  const data = { ...icon }
  const css = getCachedIconCSS(data, '.i-a')
  data.body = '<path d="M1 1"/>'
  expect(getCachedIconCSS(data, '.i-a')).not.toBe(css)
})

it('does not cache CSS generated with `customise`', () => {
  const plain = getCachedIconCSS(icon, '.i-a')
  const customise = (body: string) => body.replace('currentColor', 'red')
  const customised = getCachedIconCSS(icon, '.i-a', customise)
  expect(customised).toBe(uncached(icon, { iconSelector: '.i-a', format: 'compressed', customise }))
  expect(customised).not.toBe(plain)
  expect(getCachedIconCSS(icon, '.i-a')).toBe(plain)
  expect(getIconCSS).toHaveBeenCalledTimes(2)
})

it('clears the cache once it holds 1000 selectors', () => {
  for (let i = 0; i < 1000; i++)
    getCachedIconCSS(icon, `.i-${i}`)
  getCachedIconCSS(icon, '.i-0')
  expect(getIconCSS).toHaveBeenCalledTimes(1000)

  getCachedIconCSS(icon, '.i-overflow')
  getCachedIconCSS(icon, '.i-0')
  expect(getIconCSS).toHaveBeenCalledTimes(1002)
})
