import { addTemplate } from '@nuxt/kit'
import { afterEach, expect, it, vi } from 'vitest'
import { registerServerBundle } from '../src/bundle-server'
import type { NuxtIconModuleContext } from '../src/context'

vi.mock('@nuxt/kit', async importOriginal => ({
  ...await importOriginal<typeof import('@nuxt/kit')>(),
  addTemplate: vi.fn(() => ({ dst: '/nuxt-icon-server-bundle.mjs' })),
}))

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

async function loadCollection() {
  registerServerBundle({
    nuxt: { options: { dev: false, appConfig: {}, nitro: {} } },
    resolveServerBundle: async () => ({
      collections: [{ prefix: 'test', fetchEndpoint: 'https://example.com/icons.json' }],
      remote: false,
    }),
  } as unknown as NuxtIconModuleContext)

  const template = vi.mocked(addTemplate).mock.calls[0]![0] as { getContents: () => Promise<string> }
  const code = await template.getContents()
  const module = await import(/* @vite-ignore */ `data:text/javascript;base64,${Buffer.from(code).toString('base64')}#${crypto.randomUUID()}`)
  return module.collections.test as () => Promise<unknown>
}

it('shares an in-flight collection fetch and caches the resolved data', async () => {
  const { promise, resolve } = Promise.withResolvers<Response>()
  const fetch = vi.fn(() => promise)
  vi.stubGlobal('fetch', fetch)
  const load = await loadCollection()
  const first = load()
  const second = load()

  expect(fetch).toHaveBeenCalledTimes(1)
  const data = { prefix: 'test', icons: { item: { body: '<path d="M0 0h16v16H0z"/>' } } }
  resolve(Response.json(data))
  await expect(first).resolves.toEqual(data)
  await expect(second).resolves.toEqual(data)
  await expect(load()).resolves.toEqual(data)
  expect(fetch).toHaveBeenCalledTimes(1)
})

it.each(['fetch', 'json'])('retries after a rejected %s operation', async (failure) => {
  const fetch = vi.fn()
  if (failure === 'fetch')
    fetch.mockRejectedValueOnce(new Error('offline'))
  else
    fetch.mockResolvedValueOnce(new Response('invalid JSON'))
  const data = { prefix: 'test', icons: {} }
  fetch.mockResolvedValue(Response.json(data))
  vi.stubGlobal('fetch', fetch)
  const load = await loadCollection()

  await expect(load()).rejects.toThrow()
  await expect(load()).resolves.toEqual(data)
  expect(fetch).toHaveBeenCalledTimes(2)
})

it.each([null, false])('does not retain a falsy collection response: %s', async (value) => {
  const data = { prefix: 'test', icons: {} }
  const fetch = vi.fn()
    .mockResolvedValueOnce(Response.json(value))
    .mockResolvedValue(Response.json(data))
  vi.stubGlobal('fetch', fetch)
  const load = await loadCollection()

  await expect(load()).resolves.toBe(value)
  await expect(load()).resolves.toEqual(data)
  expect(fetch).toHaveBeenCalledTimes(2)
})
