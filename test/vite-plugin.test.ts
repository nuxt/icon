import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { build } from 'vite'
import { afterAll, beforeAll, expect, it } from 'vitest'
import { BUNDLE_MODULE_ID, NuxtIconBundle, REGISTER_MODULE_ID } from '../src/vite'

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
  root = mkdtempSync(join(tmpdir(), 'nuxt-icon-vite-plugin-'))
  installCollection(root, 'test-explicit', 'bar')
  installCollection(root, 'test-scan', 'foo')

  mkdirSync(join(root, 'src'), { recursive: true })
  // Icon usage that only the scanner can discover
  writeFileSync(join(root, 'src', 'App.vue'), `<template>
  <span class="i-test-scan-foo" />
</template>
`)
  // Entry collecting the bundled icons, so the output can be asserted
  writeFileSync(join(root, 'src', 'main.js'), `import { init } from 'virtual:nuxt-icon-bundle'
export const icons = {}
init((name, data) => { icons[name] = data })
`)
})

afterAll(() => {
  rmSync(root, { recursive: true, force: true })
})

async function buildFixture(plugin: ReturnType<typeof NuxtIconBundle>): Promise<string> {
  type BuildOutput = { output: [{ code: string }] }
  const result = await build({
    root,
    logLevel: 'silent',
    plugins: [plugin],
    build: {
      write: false,
      minify: false,
      lib: {
        entry: join(root, 'src', 'main.js'),
        formats: ['es'],
        fileName: 'out',
      },
    },
  }) as unknown as BuildOutput | BuildOutput[]

  const { output } = Array.isArray(result) ? result[0]! : result
  return output[0].code
}

it('bundles explicit, scanned and custom collection icons into the build', async () => {
  const code = await buildFixture(NuxtIconBundle({
    icons: ['test-explicit:bar'],
    scan: { additionalCollections: ['test-scan'] },
    customCollections: [{
      prefix: 'custom',
      icons: {
        baz: { body: '<circle cx="12" cy="12" r="12"/>' },
      },
      width: 24,
      height: 24,
    }],
  }))

  // Explicitly listed icon
  expect(code).toContain('test-explicit')
  // Icon found by scanning `src/App.vue`
  expect(code).toContain('test-scan')
  // Custom collection bundled through `includeCustomCollections` (default true)
  expect(code).toContain('custom')
  expect(code).toContain('circle cx=')

  // The generated module registers the icons through `init(addIcon)`
  const dataUrl = `data:text/javascript,${encodeURIComponent(code)}`
  const { icons } = await import(dataUrl)
  expect(Object.keys(icons).sort()).toEqual([
    'custom:baz',
    'test-explicit:bar',
    'test-scan:foo',
  ])
})

it('fails the build when an explicitly listed icon cannot be resolved', async () => {
  await expect(buildFixture(NuxtIconBundle({
    icons: ['not-installed:missing'],
    scan: false,
  })))
    .rejects.toThrow(/could not fetch the icon data/)
})

it('does not fail the build for unresolvable scanned icons', async () => {
  // `src/App.vue` uses `i-test-scan-foo`, but without `additionalCollections`
  // the scanner only knows official Iconify collections, so nothing resolves —
  // and nothing should fail.
  const code = await buildFixture(NuxtIconBundle({
    icons: ['test-explicit:bar'],
  }))

  expect(code).toContain('test-explicit')
  expect(code).not.toContain('test-scan')
})

it('exposes a register module that wires up @iconify/vue', async () => {
  const plugin = NuxtIconBundle()

  const resolveId = plugin.resolveId as (id: string) => string | undefined
  const load = plugin.load as (id: string) => Promise<string | undefined> | string | undefined

  const resolved = resolveId(REGISTER_MODULE_ID)
  expect(resolved).toBeTruthy()

  const code = await load(resolved!)
  expect(code).toContain(`from '@iconify/vue'`)
  expect(code).toContain(JSON.stringify(BUNDLE_MODULE_ID))
})
