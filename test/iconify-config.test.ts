import { beforeEach, describe, expect, it, vi } from 'vitest'
import { _api } from '@iconify/vue'
import type { IconifyConfig } from '../src/runtime/iconify-config'

// Capture the provider that ships with the installed @iconify/vue version, so
// each test starts from a clean default without hard-coding the host list.
const defaultResources = [..._api.getAPIConfig('')!.resources]

async function load() {
  vi.resetModules()
  const iconify = await import('@iconify/vue')
  iconify._api.setFetch(globalThis.fetch)
  iconify.addAPIProvider('', { resources: defaultResources })
  const config = await import('../src/runtime/iconify-config')
  return { iconify, ...config }
}

function createConfig(overrides: Partial<IconifyConfig> = {}): IconifyConfig {
  return {
    resources: ['/api/_nuxt_icon'],
    fetch: vi.fn() as unknown as typeof fetch,
    customIconsLoader: vi.fn(),
    customCollections: [],
    ...overrides,
  }
}

describe('applyIconifyConfig', () => {
  let ctx: Awaited<ReturnType<typeof load>>

  beforeEach(async () => {
    ctx = await load()
  })

  it('configures an untouched Iconify instance', () => {
    const config = createConfig()
    ctx.setIconifyConfig(config)
    ctx.applyIconifyConfig(ctx.iconify)

    expect(ctx.iconify._api.getFetch()).toBe(config.fetch)
    expect(ctx.iconify._api.getAPIConfig('')!.resources).toEqual(['/api/_nuxt_icon'])
  })

  it('replaces the default public provider shipped by Iconify', () => {
    // @iconify/vue 5.0.5 added `api2.iconify.design` to the default resources
    ctx.iconify.addAPIProvider('', { resources: ['https://api.iconify.design', 'https://api2.iconify.design'] })

    ctx.setIconifyConfig(createConfig())
    ctx.applyIconifyConfig(ctx.iconify)

    expect(ctx.iconify._api.getAPIConfig('')!.resources).toEqual(['/api/_nuxt_icon'])
  })

  // Iconify's own API is the only provider we may replace. These are the hosts
  // it has shipped so far, plus a made-up one to keep the pattern honest.
  it.each([
    'https://api.iconify.design',
    'https://api2.iconify.design',
    'https://api42.iconify.design',
  ])('replaces the public Iconify host %s', (resource) => {
    ctx.iconify.addAPIProvider('', { resources: [resource] })
    ctx.setIconifyConfig(createConfig())
    ctx.applyIconifyConfig(ctx.iconify)

    expect(ctx.iconify._api.getAPIConfig('')!.resources).toEqual(['/api/_nuxt_icon'])
  })

  // Anything else was set by the app on purpose, so it stays untouched. The
  // lookalikes here are the reason the check is anchored to the whole host.
  it.each([
    'https://api.iconify.design.evil.com',
    'https://api.iconify.design@evil.com',
    'https://evil.com/https://api.iconify.design',
    'http://api.iconify.design',
    'https://api-2.iconify.design',
    'https://apiiconify.design',
  ])('keeps a provider set by the app for %s', (resource) => {
    ctx.iconify.addAPIProvider('', { resources: [resource] })
    ctx.setIconifyConfig(createConfig())
    ctx.applyIconifyConfig(ctx.iconify)

    expect(ctx.iconify._api.getAPIConfig('')!.resources).toEqual([resource])
  })

  it('keeps a provider with a custom resource mixed in', () => {
    const resources = ['https://api.iconify.design', 'https://icons.example.com']
    ctx.iconify.addAPIProvider('', { resources })
    ctx.setIconifyConfig(createConfig())
    ctx.applyIconifyConfig(ctx.iconify)

    expect(ctx.iconify._api.getAPIConfig('')!.resources).toEqual(resources)
  })

  it('keeps a fetch function and provider set by the app', () => {
    const appFetch = vi.fn() as unknown as typeof fetch
    ctx.iconify._api.setFetch(appFetch)
    ctx.iconify.addAPIProvider('', { resources: ['https://icons.example.com'] })

    ctx.setIconifyConfig(createConfig())
    ctx.applyIconifyConfig(ctx.iconify)

    expect(ctx.iconify._api.getFetch()).toBe(appFetch)
    expect(ctx.iconify._api.getAPIConfig('')!.resources).toEqual(['https://icons.example.com'])
  })

  it('replaces its own configuration', () => {
    ctx.setIconifyConfig(createConfig())
    ctx.applyIconifyConfig(ctx.iconify)
    const next = createConfig({ resources: ['/base/api/_nuxt_icon'] })
    ctx.setIconifyConfig(next)
    ctx.applyIconifyConfig(ctx.iconify)

    expect(ctx.iconify._api.getFetch()).toBe(next.fetch)
    expect(ctx.iconify._api.getAPIConfig('')!.resources).toEqual(['/base/api/_nuxt_icon'])
  })

  it('always blocks API requests when no resources are configured', () => {
    ctx.iconify._api.setFetch(vi.fn() as unknown as typeof fetch)
    const config = createConfig({ resources: [] })
    ctx.setIconifyConfig(config)
    ctx.applyIconifyConfig(ctx.iconify)

    expect(ctx.iconify._api.getFetch()).toBe(config.fetch)
  })

  it('registers custom collection loaders', async () => {
    const config = createConfig({
      customCollections: ['custom'],
      customIconsLoader: vi.fn(async (icons: string[], prefix: string) => ({
        prefix,
        icons: Object.fromEntries(icons.map(name => [name, { body: '<path d="M0 0h1"/>' }])),
      })),
    })
    ctx.setIconifyConfig(config)
    ctx.applyIconifyConfig(ctx.iconify)

    expect(await ctx.iconify.loadIcon('custom:foo')).toMatchObject({ body: '<path d="M0 0h1"/>' })
    expect(config.customIconsLoader).toHaveBeenCalledWith(['foo'], 'custom', '')
  })
})
