import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, expect, it } from 'vitest'
import type { CustomCollection } from '../src/core/types'
import { NuxtIconModuleContext } from '../src/context'

const SVG = '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M0 0h24v24H0z"/></svg>'

function writeIcon(dir: string, name: string) {
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, `${name}.svg`), SVG)
}

interface Layer {
  cwd: string
  customCollections?: CustomCollection[]
}

// Nuxt clones layer configs when merging them into `nuxt.options`, so the
// merged `customCollections` are structurally equal to, but never the same
// objects as, the ones on the layer configs. The fixture copies them the same
// way so the module cannot cheat by comparing references.
function createContext(rootDir: string, layers: Layer[], collections: CustomCollection[]) {
  const nuxt = {
    options: {
      rootDir,
      dev: false,
      nitro: {},
      _layers: layers.map(layer => ({
        cwd: layer.cwd,
        config: layer.customCollections
          ? { icon: { customCollections: structuredClone(layer.customCollections) } }
          : {},
      })),
    },
  }
  return new NuxtIconModuleContext(nuxt as never, {
    provider: 'server',
    serverBundle: { collections: [] },
    customCollections: structuredClone(collections),
  } as never)
}

let root: string
const appDir = () => join(root, 'app')
const layerDir = () => join(root, 'layer')
const outsideDir = () => join(root, 'outside')

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'nuxt-icon-custom-collections-'))
  // Same relative path in both, with a different icon in each, so a `dir`
  // resolved against the wrong base still finds a directory and the test fails
  // on the icon names rather than on an empty result.
  writeIcon(join(appDir(), 'app/assets/icons'), 'app-only')
  writeIcon(join(layerDir(), 'app/assets/icons'), 'logo')
  writeIcon(outsideDir(), 'outside')
})

afterAll(() => {
  rmSync(root, { recursive: true, force: true })
})

it('resolves a layer collection `dir` against the layer, not the app rootDir', async () => {
  const collection: CustomCollection = { prefix: 'layer-icons', dir: './app/assets/icons' }
  const context = createContext(
    appDir(),
    [{ cwd: appDir() }, { cwd: layerDir(), customCollections: [collection] }],
    [collection],
  )

  const [loaded] = await context.loadCustomCollection()

  expect(Object.keys(loaded!.icons)).toEqual(['logo'])
})

it('includes a layer collection in the server bundle', async () => {
  const collection: CustomCollection = { prefix: 'layer-icons', dir: './app/assets/icons' }
  const context = createContext(
    appDir(),
    [{ cwd: appDir() }, { cwd: layerDir(), customCollections: [collection] }],
    [collection],
  )

  const bundle = await context.resolveServerBundle()
  const resolved = bundle.collections.find(c => typeof c !== 'string' && c.prefix === 'layer-icons')

  expect(resolved).toBeTruthy()
  expect(Object.keys((resolved as { icons: object }).icons)).toEqual(['logo'])
})

it('keeps resolving an app collection `dir` from rootDir', async () => {
  const collection: CustomCollection = { prefix: 'app-icons', dir: './app/assets/icons' }
  const context = createContext(
    appDir(),
    [{ cwd: appDir(), customCollections: [collection] }, { cwd: layerDir() }],
    [collection],
  )

  const [loaded] = await context.loadCustomCollection()

  expect(Object.keys(loaded!.icons)).toEqual(['app-only'])
})

it('gives each layer its own directory when two layers declare the same collection', async () => {
  const collection: CustomCollection = { prefix: 'icons', dir: './app/assets/icons' }
  const context = createContext(
    appDir(),
    [
      { cwd: appDir(), customCollections: [collection] },
      { cwd: layerDir(), customCollections: [collection] },
    ],
    [collection, collection],
  )

  const loaded = await context.loadCustomCollection()

  expect(loaded.map(c => Object.keys(c.icons))).toEqual([['app-only'], ['logo']])
})

it('leaves an absolute `dir` alone', async () => {
  const collection: CustomCollection = { prefix: 'absolute-icons', dir: outsideDir() }
  const context = createContext(
    appDir(),
    [{ cwd: appDir() }, { cwd: layerDir(), customCollections: [collection] }],
    [collection],
  )

  const [loaded] = await context.loadCustomCollection()

  expect(Object.keys(loaded!.icons)).toEqual(['outside'])
})

it('falls back to rootDir for a collection that no layer declared', async () => {
  // e.g. another module pushing onto `icon.customCollections` after the merge
  const context = createContext(
    appDir(),
    [{ cwd: appDir() }, { cwd: layerDir() }],
    [{ prefix: 'programmatic', dir: './app/assets/icons' }],
  )

  const [loaded] = await context.loadCustomCollection()

  expect(Object.keys(loaded!.icons)).toEqual(['app-only'])
})
