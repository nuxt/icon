import { addAPIProvider, _api, setCustomIconsLoader } from '@iconify/vue'
import type { IconifyJSON } from '@iconify/types'
import type { NuxtIconRuntimeOptions } from '../types'
import { defineNuxtPlugin, useAppConfig, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin({
  name: '@nuxt/icon',
  setup() {
    const configs = useRuntimeConfig()
    const options = useAppConfig().icon as NuxtIconRuntimeOptions

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore type incompatible
    _api.setFetch($fetch.native)

    const resources: string[] = []
    if (options.provider === 'server') {
      const baseURL = configs.app?.baseURL?.replace(/\/$/, '') ?? ''

      resources.push(baseURL + (options.localApiEndpoint || '/api/_nuxt_icon'))
      if (options.fallbackToApi === true || options.fallbackToApi === 'client-only') {
        resources.push(options.iconifyApiEndpoint!)
      }
    }
    else if (options.provider === 'none') {
      // Provide a no-op fetch function to prevent Iconify from fetching icons
      _api.setFetch(() => Promise.resolve(new Response()))
    }
    else {
      resources.push(options.iconifyApiEndpoint!)
    }

    async function customIconLoader(icons: string[], prefix: string): Promise<IconifyJSON | null> {
      try {
        const data = await $fetch(resources[0] + '/' + prefix + '.json', {
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
