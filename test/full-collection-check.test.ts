import { fileURLToPath } from 'node:url'
import { loadNuxt } from '@nuxt/kit'
import { isPackageExists } from 'local-pkg'
import { beforeEach, expect, it, onTestFinished, vi } from 'vitest'
import { getResolvePaths } from '../src/collections'
import { getCollectionPath } from '../src/core/collections'
import Module from '../src/module'

vi.mock('local-pkg', async (importOriginal) => {
  const mod = await importOriginal<typeof import('local-pkg')>()
  return { ...mod, isPackageExists: vi.fn(mod.isPackageExists) }
})

beforeEach(() => {
  vi.mocked(isPackageExists).mockClear()
})

function fullCollectionChecks() {
  return vi.mocked(isPackageExists).mock.calls.filter(([name]) => name === '@iconify/json')
}

function createNuxt() {
  return { options: { rootDir: process.cwd(), workspaceDir: process.cwd(), _layers: [] } } as never
}

it('checks for @iconify/json once per build', async () => {
  // Answer as if @iconify/json is not installed, so the generated imports don't depend on the checkout
  const { isPackageExists: actual } = await vi.importActual<typeof import('local-pkg')>('local-pkg')
  vi.mocked(isPackageExists).mockImplementation((name, options) => name === '@iconify/json' ? false : actual(name, options))
  onTestFinished(() => {
    vi.mocked(isPackageExists).mockImplementation(actual)
  })

  // `loadNuxt` runs the `nitro:config` hook, and collections are discovered from the `@iconify-json/*` dev dependencies
  const nuxt = await loadNuxt({
    cwd: fileURLToPath(new URL('./fixtures/full-collection-check', import.meta.url)),
    dev: false,
    overrides: {
      modules: [Module],
      icon: {
        serverBundle: { externalizeIconsJson: true },
      },
    },
  })
  onTestFinished(() => nuxt.close())

  const template = nuxt.options.build.templates.find(t => t.filename === 'nuxt-icon-server-bundle.mjs')!
  const code = await template.getContents!({ nuxt, app: {}, options: {} } as never)
  const traceInclude = (nuxt as unknown as { _nitro: { options: { externals: { traceInclude: string[] } } } })._nitro.options.externals.traceInclude

  expect(fullCollectionChecks()).toHaveLength(1)
  for (const collection of ['logos', 'ph', 'uil']) {
    expect(code).toContain(`'${collection}': () => import('@iconify-json/${collection}/icons.json', { with: { type: 'json' } })`)
    expect(traceInclude).toContainEqual(expect.stringMatching(`/@iconify-json/${collection}/icons.json$`))
  }
})

it('checks again when the paths of a Nuxt instance change', () => {
  const nuxt = createNuxt() as { options: { workspaceDir: string } }
  vi.mocked(isPackageExists).mockReturnValueOnce(true)
  expect(getCollectionPath('ph', getResolvePaths(nuxt as never))).toBe('@iconify/json/json/ph.json')
  nuxt.options.workspaceDir = '/elsewhere'
  vi.mocked(isPackageExists).mockReturnValueOnce(false)
  expect(getCollectionPath('ph', getResolvePaths(nuxt as never))).toBe('@iconify-json/ph/icons.json')
  expect(fullCollectionChecks()).toHaveLength(2)
})

it('reuses the answer within a Nuxt instance and checks again in a new one', () => {
  const nuxt = createNuxt()
  vi.mocked(isPackageExists).mockReturnValueOnce(true)
  expect(getCollectionPath('ph', getResolvePaths(nuxt))).toBe('@iconify/json/json/ph.json')
  expect(getCollectionPath('uil', getResolvePaths(nuxt))).toBe('@iconify/json/json/uil.json')
  expect(fullCollectionChecks()).toHaveLength(1)

  vi.mocked(isPackageExists).mockReturnValueOnce(false)
  expect(getCollectionPath('ph', getResolvePaths(createNuxt()))).toBe('@iconify-json/ph/icons.json')
  expect(fullCollectionChecks()).toHaveLength(2)
})

it('checks on every call for paths that do not come from getResolvePaths', () => {
  const resolvePaths = [process.cwd()]
  vi.mocked(isPackageExists).mockReturnValueOnce(true)
  expect(getCollectionPath('ph', resolvePaths)).toBe('@iconify/json/json/ph.json')
  vi.mocked(isPackageExists).mockReturnValueOnce(false)
  expect(getCollectionPath('ph', resolvePaths)).toBe('@iconify-json/ph/icons.json')
  expect(fullCollectionChecks()).toHaveLength(2)
})
