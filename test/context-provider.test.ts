import { describe, expect, it } from 'vitest'
import { NuxtIconModuleContext } from '../src/context'
import type { IconProviderOption } from '../src/runtime/provider'

function createContext(provider: IconProviderOption, includeCustomCollections?: boolean) {
  const nuxt = {
    options: {
      dev: false,
      nitro: {},
      rootDir: process.cwd(),
      workspaceDir: process.cwd(),
      _layers: [],
    },
    callHook: async () => {},
  }
  return new NuxtIconModuleContext(nuxt as never, {
    provider,
    serverBundle: { collections: ['ph'] },
    clientBundle: { includeCustomCollections },
    customCollections: [{
      prefix: 'x',
      icons: { a: { body: '<path d="M0 0h24v24H0z"/>' } },
      width: 24,
      height: 24,
    }],
  } as never)
}

describe('server bundle gating', () => {
  it.each<IconProviderOption>([
    'iconify',
    'none',
    { server: 'iconify', client: 'iconify' },
    { server: 'none', client: 'iconify' },
  ])('is disabled when no side uses the server provider: %j', async (provider) => {
    const bundle = await createContext(provider).resolveServerBundle()
    expect(bundle.disabled).toBe(true)
  })

  it.each<IconProviderOption>([
    'server',
    { server: 'server', client: 'iconify' },
    { server: 'iconify', client: 'server' },
  ])('is enabled when at least one side uses the server provider: %j', async (provider) => {
    const bundle = await createContext(provider).resolveServerBundle()
    expect(bundle.disabled).toBe(false)
    expect(bundle.collections).toContain('ph')
  })
})

describe('clientBundle.includeCustomCollections default', () => {
  it.each<IconProviderOption>([
    'iconify',
    { server: 'server', client: 'iconify' },
    { server: 'iconify', client: 'server' },
  ])('includes custom collections when a side does not use the server provider: %j', async (provider) => {
    const result = await createContext(provider).loadClientBundleCollections()
    expect(result.collections.find(c => c.prefix === 'x')?.icons.a).toBeTruthy()
  })

  it.each<IconProviderOption>([
    'server',
    { server: 'server', client: 'server' },
  ])('does not include custom collections when both sides use the server provider: %j', async (provider) => {
    const result = await createContext(provider).loadClientBundleCollections()
    expect(result.collections.find(c => c.prefix === 'x')).toBeUndefined()
  })
})

describe('shouldIncludeCustomCollections', () => {
  it.each<[IconProviderOption, boolean]>([
    ['server', false],
    ['iconify', true],
    ['none', true],
    [{ server: 'server', client: 'server' }, false],
    [{ server: 'server', client: 'iconify' }, true],
    [{ server: 'iconify', client: 'server' }, true],
  ])('defaults by provider: %j -> %s', (provider, expected) => {
    expect(createContext(provider).shouldIncludeCustomCollections()).toBe(expected)
  })

  it('respects an explicit value', () => {
    expect(createContext('server', true).shouldIncludeCustomCollections()).toBe(true)
    expect(createContext({ server: 'server', client: 'iconify' }, false).shouldIncludeCustomCollections()).toBe(false)
  })

  it('is used by the client bundle', async () => {
    const included = await createContext('server', true).loadClientBundleCollections()
    expect(included.collections.find(c => c.prefix === 'x')?.icons.a).toBeTruthy()

    const excluded = await createContext({ server: 'server', client: 'iconify' }, false).loadClientBundleCollections()
    expect(excluded.collections.find(c => c.prefix === 'x')).toBeUndefined()
  })
})
