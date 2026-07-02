import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, expect, it } from 'vitest'
import type { IconifyIcon } from '@iconify/types'
import { generateClientBundleCode, resolveBundleIcons } from '../src/core/bundle'

// Install a fake `@iconify-json/<prefix>` collection into `<dir>/node_modules`
function installCollection(dir: string, prefix: string, icon: string) {
  const collectionDir = join(dir, 'node_modules', '@iconify-json', prefix)
  mkdirSync(collectionDir, { recursive: true })
  writeFileSync(join(collectionDir, 'package.json'), JSON.stringify({
    name: `@iconify-json/${prefix}`,
    version: '0.0.0',
    main: 'index.js',
    exports: {
      './*': './*',
      './icons.json': './icons.json',
    },
  }))
  writeFileSync(join(collectionDir, 'icons.json'), JSON.stringify({
    prefix,
    icons: {
      [icon]: { body: '<path d="M0 0h24v24H0z"/>' },
    },
    width: 24,
    height: 24,
  }))
}

let root: string

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'nuxt-icon-bundle-'))
  installCollection(root, 'test-bundle', 'foo')
  // Same prefix and icon name as the custom collection in the precedence test,
  // but with a different body (`<path .../>` instead of `<rect .../>`)
  installCollection(root, 'test-conflict', 'baz')
})

afterAll(() => {
  rmSync(root, { recursive: true, force: true })
})

it('resolves explicit, scanned and extra icons', async () => {
  const result = await resolveBundleIcons({
    icons: ['test-bundle:foo'],
    resolvePaths: [root],
  })

  expect(result.failed).toEqual([])
  expect(result.dropped).toEqual([])
  expect(result.count).toBe(1)
  expect(result.collections.find(c => c.prefix === 'test-bundle')?.icons.foo).toBeTruthy()
})

it('strips the `i-`/`i:` prefix from icon names', async () => {
  const result = await resolveBundleIcons({
    icons: ['i-test-bundle:foo', 'i:test-bundle:foo'],
    resolvePaths: [root],
  })

  expect(result.failed).toEqual([])
  expect(result.count).toBe(1)
})

it('hard-fails only for explicitly requested icons', async () => {
  const result = await resolveBundleIcons({
    icons: ['not-installed:missing'],
    resolvePaths: [root],
  })

  expect(result.failed).toEqual(['not-installed:missing'])
  expect(result.dropped).toEqual([])
})

it('silently skips unresolvable scanned icons', async () => {
  const result = await resolveBundleIcons({
    icons: ['test-bundle:foo'],
    scannedIcons: ['not-installed:missing', 'test-bundle:does-not-exist'],
    resolvePaths: [root],
  })

  expect(result.failed).toEqual([])
  expect(result.dropped).toEqual([])
  expect(result.count).toBe(1)
})

it('reports unresolvable extra icons as dropped', async () => {
  const result = await resolveBundleIcons({
    extraIcons: ['not-installed:missing', 'test-bundle:foo'],
    resolvePaths: [root],
  })

  expect(result.failed).toEqual([])
  expect(result.dropped).toEqual(['not-installed:missing'])
  expect(result.count).toBe(1)
})

it('bundles whole custom collections when includeCustomCollections is set', async () => {
  const result = await resolveBundleIcons({
    customCollections: [{
      prefix: 'custom',
      icons: {
        baz: { body: '<path d="M0 0h24v24H0z"/>' },
      },
      width: 24,
      height: 24,
    }],
    includeCustomCollections: true,
    resolvePaths: [root],
  })

  expect(result.failed).toEqual([])
  expect(result.count).toBe(1)
  expect(result.collections.find(c => c.prefix === 'custom')?.icons.baz).toBeTruthy()
})

it('resolves icons from custom collections before installed packages', async () => {
  // `@iconify-json/test-conflict` is installed with a different `baz` body
  // (see `beforeAll`), so this proves the custom collection takes precedence
  const result = await resolveBundleIcons({
    icons: ['test-conflict:baz'],
    customCollections: [{
      prefix: 'test-conflict',
      icons: {
        baz: { body: '<rect width="24" height="24"/>' },
      },
    }],
    resolvePaths: [root],
  })

  expect(result.failed).toEqual([])
  expect(result.count).toBe(1)
  expect(result.collections.find(c => c.prefix === 'test-conflict')?.icons.baz?.body)
    .toBe('<rect width="24" height="24"/>')
})

it('generates an executable init module', async () => {
  const { collections } = await resolveBundleIcons({
    icons: ['test-bundle:foo'],
    resolvePaths: [root],
  })
  const { code, bundleSizeKb } = generateClientBundleCode(collections)

  expect(bundleSizeKb).toBeGreaterThan(0)

  const module = await import(`data:text/javascript,${encodeURIComponent(code)}`)
  const icons: Record<string, IconifyIcon> = {}
  module.init((name: string, data: IconifyIcon) => {
    icons[name] = data
  })

  expect(Object.keys(icons)).toEqual(['test-bundle:foo'])
  expect(icons['test-bundle:foo']?.body).toContain('<path')
})

it('generates a no-op init module when there is nothing to bundle', () => {
  const { code, bundleSizeKb } = generateClientBundleCode([])
  expect(code).toBe('export function init() {}')
  expect(bundleSizeKb).toBe(0)
})

it('throws when the bundle exceeds the size limit', async () => {
  const { collections } = await resolveBundleIcons({
    icons: ['test-bundle:foo'],
    resolvePaths: [root],
  })

  expect(() => generateClientBundleCode(collections, { sizeLimitKb: 0.01 }))
    .toThrow(/size limit exceeded/)
})
