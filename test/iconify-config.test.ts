import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { IconifyConfig } from '../src/runtime/iconify-config'

async function load() {
  vi.resetModules()
  const iconify = await import('@iconify/vue')
  iconify._api.setFetch(globalThis.fetch)
  iconify.addAPIProvider('', { resources: ['https://api.iconify.design'] })
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
