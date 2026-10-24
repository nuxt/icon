import { addAPIProvider, _api, setCustomIconsLoader } from '@iconify/vue'
import type { IconifyJSON } from '@iconify/types'
import type { NuxtIconRuntimeOptions } from '../types'
import { getSideProvider } from './provider'
import { defineNuxtPlugin, useAppConfig, useRequestFetch, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin({
  name: '@nuxt/icon',
  setup() {
    const configs = useRuntimeConfig()
    const options = useAppConfig().icon as NuxtIconRuntimeOptions
    const requestFetch = useRequestFetch()
    const nativeFetch = (requestFetch as { native?: typeof globalThis.fetch }).native

    _api.setFetch((input, init) => {
      const nitroFetch = (globalThis as typeof globalThis & {
        $fetch?: { native?: typeof globalThis.fetch }
      }).$fetch?.native
      return (nativeFetch || nitroFetch || globalThis.fetch)(input, init)
    })

    const provider = getSideProvider(options.provider, import.meta.server ? 'server' : 'client')

    const resources: string[] = []
    if (provider === 'server') {
      const baseURL = configs.app?.baseURL?.replace(/\/$/, '') ?? ''

      resources.push(baseURL + (options.localApiEndpoint || '/api/_nuxt_icon'))
      if (options.fallbackToApi === true || options.fallbackToApi === 'client-only') {
        resources.push(options.iconifyApiEndpoint!)
      }
    }
    else if (provider === 'none') {
      // Provide a no-op fetch function to prevent Iconify from fetching icons
      _api.setFetch(() => Promise.resolve(new Response()))
    }
    else {
      resources.push(options.iconifyApiEndpoint!)
    }

    async function loadCustomIconsChunk(icons: string[], prefix: string): Promise<IconifyJSON | null> {
      try {
        const data = await requestFetch(resources[0] + '/' + prefix + '.json', {
          query: {
            icons: icons.join(','),
          },
        }) as IconifyJSON
        // Simple data validation
        if (!data || data.prefix !== prefix || !data.icons)
          throw new Error('Invalid data' + JSON.stringify(data))
        return data as IconifyJSON
      }
      catch (e) {
        console.error('Failed to load custom icons', e)
        return null
      }
    }

    async function customIconLoader(icons: string[], prefix: string): Promise<IconifyJSON | null> {
      // Split large lists into several requests to stay under URL length limits (431 / 414)
      const chunks: string[][] = [[]]
      let length = 0
      for (const name of icons) {
        const nameLength = encodeURIComponent(name).length
        if (length + nameLength > 2000 && chunks.at(-1)!.length) {
          chunks.push([])
          length = 0
        }
        chunks.at(-1)!.push(name)
        length += nameLength + 1
      }
      const results = (await Promise.all(chunks.map(chunk => loadCustomIconsChunk(chunk, prefix))))
        .filter((data): data is IconifyJSON => !!data)
      if (!results.length)
        return null
      // Keep collection-level properties (width, height, ...) from the responses
      return results.reduce((acc, data) => ({
        ...acc,
        ...data,
        icons: { ...acc.icons, ...data.icons },
        aliases: { ...acc.aliases, ...data.aliases },
      }))
    }

    addAPIProvider('', { resources })

    // Register custom collections handlers
    for (const prefix of options.customCollections || []) {
      if (prefix)
        setCustomIconsLoader(customIconLoader, prefix)
    }
  },

// For type portability
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any
