import { basename } from 'pathe'
import { getIcons } from '@iconify/utils'
import { hash } from 'ohash'
import { createError, getQuery, type H3Event } from 'h3'
import { consola } from 'consola'
import type { NuxtIconRuntimeOptions } from '../../schema-types'
// @ts-expect-error tsconfig.server has the types
import { useAppConfig, getRequestURL, defineCachedEventHandler } from '#imports'
import { collections } from '#nuxt-icon-server-bundle'

const warnOnceSet = /* @__PURE__ */ new Set<string>()

const DEFAULT_ENDPOINT = 'https://api.iconify.design'

export default defineCachedEventHandler(async (event: H3Event) => {
  const url = getRequestURL(event) as URL
  if (!url)
    return createError({ status: 400, message: 'Invalid icon request' })

  const options = useAppConfig().icon as NuxtIconRuntimeOptions
  const collectionName = event.context.params?.collection?.replace(/\.json$/, '')
  const collection = collectionName
    ? await collections[collectionName]?.()
    : null

  const apiEndPoint = options.iconifyApiEndpoint || DEFAULT_ENDPOINT
  const icons = url.searchParams.get('icons')?.split(',')

  if (collection) {
    if (icons?.length) {
      const data = getIcons(
        collection,
        icons,
      )
      consola.debug(`[Icon] serving ${(icons || []).map(i => '`' + collectionName + ':' + i + '`').join(',')} from bundled collection`)
      return data
    }
  }
  else if (import.meta.dev) {
    // Warn only once per collection, and only with the default endpoint
    if (collectionName && !warnOnceSet.has(collectionName) && apiEndPoint === DEFAULT_ENDPOINT) {
      consola.warn([
        `[Icon] Collection \`${collectionName}\` is not found locally`,
        `We suggest to install it via \`npm i -D @iconify-json/${collectionName}\` to provide the best end-user experience.`,
      ].join('\n'))
      warnOnceSet.add(collectionName)
    }
  }

  if (options.fallbackToApi === true || options.fallbackToApi === 'server-only') {
    const apiUrl = new URL('./' + basename(url.pathname) + url.search, apiEndPoint)
    consola.debug(`[Icon] fetching ${(icons || []).map(i => '`' + collectionName + ':' + i + '`').join(',')} from iconify api`)
    if (apiUrl.host !== new URL(apiEndPoint).host) {
      return createError({ status: 400, message: 'Invalid icon request' })
    }
    try {
      const data = await $fetch(apiUrl.href)
      return data
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (e: any) {
      consola.error(e)
      if (e.status === 404)
        return createError({ status: 404 })
      else
        return createError({ status: 500, message: 'Failed to fetch fallback icon' })
    }
  }
  return createError({ status: 404 })
}, {
  group: 'nuxt',
  name: 'icon',
  getKey(event: H3Event) {
    const collection = event.context.params?.collection?.replace(/\.json$/, '') || 'unknown'
    const icons = String(getQuery(event).icons || '')
    return `${collection}_${icons.split(',')[0]}_${icons.length}_${hash(icons)}`
  },
  swr: true,
  maxAge: 60 * 60 * 24 * 7, // 1 week
})
