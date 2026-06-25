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

function createContext(rootDir: string, workspaceDir: string, icons: string[]) {
  const nuxt = {
    options: { rootDir, workspaceDir },
    callHook: async () => {},
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
