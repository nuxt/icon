import { addAPIProvider, _api, disableCache } from '@iconify/vue'
import type { NuxtIconRuntimeOptions } from '../types'
import { defineNuxtPlugin, useAppConfig, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin({
  name: 'nuxt-icon',
  setup() {
    const config = useRuntimeConfig()
    const options = useAppConfig().icon as NuxtIconRuntimeOptions

    // @ts-expect-error - missing types
    _api.setFetch($fetch.native)

    disableCache('all')

    const resources: string[] = []
    if (options.provider === 'server') {
      const baseURL = config.app?.baseURL?.replace(/\/$/, '') ?? ''

      resources.push(baseURL + '/api/_nuxt_icon')
      if (options.fallbackToApi) {
        resources.push(options.iconifyApiEndpoint!)
      }
    }
    else {
      resources.push(options.iconifyApiEndpoint!)
    }

    addAPIProvider('', { resources })
  },
})
