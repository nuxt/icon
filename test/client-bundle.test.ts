import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, expect, it } from 'vitest'
import { NuxtIconModuleContext } from '../src/context'

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

function createContext(rootDir: string, workspaceDir: string, icons: string[], hookIcons: string[] = []) {
  const nuxt = {
    options: { rootDir, workspaceDir },
    // Mimic a module contributing icons through the `icon:clientBundleIcons` hook
    callHook: async (_name: string, set: Set<string>) => {
      for (const icon of hookIcons)
        set.add(icon)
    },
  }
  return new NuxtIconModuleContext(nuxt as never, {
    clientBundle: { icons },
  } as never)
}

// The collection lives in a subproject's `node_modules` while the command is
// launched from a workspace root (`process.cwd()`), so it can only be resolved
// from `nuxt.options.rootDir` / `workspaceDir`, never from `process.cwd()`.
let root: string
const appDir = () => join(root, 'app')
const wsDir = () => join(root, 'ws')
const emptyDir = () => join(root, 'empty')

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'nuxt-icon-client-bundle-'))
  installCollection(appDir(), 'nuxt-icon-test', 'foo')
  installCollection(wsDir(), 'nuxt-icon-test-ws', 'bar')
  mkdirSync(emptyDir(), { recursive: true })
})

afterAll(() => {
  rmSync(root, { recursive: true, force: true })
})

it('resolves client bundle collections from rootDir, not process.cwd()', async () => {
  const context = createContext(appDir(), appDir(), ['nuxt-icon-test:foo'])
  const result = await context.loadClientBundleCollections()

  expect(result.failed).toEqual([])
  expect(result.count).toBe(1)
  expect(result.collections.find(c => c.prefix === 'nuxt-icon-test')?.icons.foo).toBeTruthy()
})

it('falls back to workspaceDir when the collection is not under rootDir', async () => {
  // `rootDir` has no collection and is not nested under `workspaceDir`, so the
  // first lookup returns undefined and resolution must fall back to workspaceDir.
  const context = createContext(emptyDir(), wsDir(), ['nuxt-icon-test-ws:bar'])
  const result = await context.loadClientBundleCollections()

  expect(result.failed).toEqual([])
  expect(result.count).toBe(1)
  expect(result.collections.find(c => c.prefix === 'nuxt-icon-test-ws')?.icons.bar).toBeTruthy()
})

it('does not hard-fail when a hook-contributed icon cannot be resolved', async () => {
  // A module adds an icon from a collection that is not installed. It must be
  // best-effort: omitted from the bundle (so it falls back to runtime loading)
  // and never added to `failed` (which would throw in a production build).
  const context = createContext(appDir(), appDir(), ['nuxt-icon-test:foo'], ['not-installed:missing'])
  const result = await context.loadClientBundleCollections()

  expect(result.failed).toEqual([])
  expect(result.dropped).toEqual(['not-installed:missing'])
  expect(result.count).toBe(1)
  expect(result.collections.find(c => c.prefix === 'not-installed')).toBeUndefined()
  expect(result.collections.find(c => c.prefix === 'nuxt-icon-test')?.icons.foo).toBeTruthy()
})

it('does not hard-fail when a hook-contributed icon name does not exist in an installed collection', async () => {
  // The collection is installed but the specific icon name does not exist
  // (e.g. version skew). Still best-effort, not a hard failure.
  const context = createContext(appDir(), appDir(), [], ['nuxt-icon-test:does-not-exist'])
  const result = await context.loadClientBundleCollections()

  expect(result.failed).toEqual([])
  expect(result.dropped).toEqual(['nuxt-icon-test:does-not-exist'])
  expect(result.count).toBe(0)
})

it('still hard-fails when an icon explicitly listed in clientBundle.icons cannot be resolved', async () => {
  const context = createContext(appDir(), appDir(), ['not-installed:missing'])
  const result = await context.loadClientBundleCollections()

  expect(result.failed).toEqual(['not-installed:missing'])
  expect(result.dropped).toEqual([])
})
