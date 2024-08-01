import { addAPIProvider, _api, disableCache } from '@iconify/vue'
import type { Plugin } from 'nuxt/app'
import type { NuxtIconRuntimeOptions } from '../types'
import { defineNuxtPlugin, useAppConfig, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin({
  name: '@nuxt/icon',
  setup() {
    const config = useRuntimeConfig()
    const options = useAppConfig().icon as NuxtIconRuntimeOptions

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore type incompatible
    _api.setFetch($fetch.native)

    disableCache('all')

    const resources: string[] = []
    if (options.provider === 'server') {
      const baseURL = config.app?.baseURL?.replace(/\/$/, '') ?? ''

      resources.push(baseURL + (options.localApiEndpoint || '/api/_nuxt_icon'))
      if (options.fallbackToApi) {
        resources.push(options.iconifyApiEndpoint!)
      }
    }
    else {
      resources.push(options.iconifyApiEndpoint!)
    }

    addAPIProvider('', { resources })
  },
}) as Plugin
