import { getIcons } from '@iconify/utils'
import { hash } from 'ohash'
import { createError, type H3Event } from 'h3'
import { parseQuery, parsePath } from 'ufo'
import { consola } from 'consola'
import type { NuxtIconRuntimeOptions } from '../../schema-types'
// @ts-expect-error tsconfig.server has the types
import { useAppConfig, defineCachedEventHandler } from '#imports'
import { collections } from '#nuxt-icon-server-bundle'

const warnOnceSet = /* @__PURE__ */ new Set<string>()

const DEFAULT_ENDPOINT = 'https://api.iconify.design'

function getInstallCommand(pkg: string): string {
  const ua = process.env.npm_config_user_agent || ''
  if (ua.startsWith('pnpm')) return `pnpm add -D ${pkg}`
  if (ua.startsWith('yarn')) return `yarn add -D ${pkg}`
  if (ua.startsWith('bun')) return `bun add -D ${pkg}`
  return `npm i -D ${pkg}`
}

export default defineCachedEventHandler(async (event: H3Event) => {
  const options = useAppConfig().icon as NuxtIconRuntimeOptions
  const collectionName = event.context.params?.collection?.replace(/\.json$/, '')
  const collection = collectionName && Object.hasOwn(collections, collectionName)
    ? await collections[collectionName]?.()
    : null

  const apiEndPoint = options.iconifyApiEndpoint || DEFAULT_ENDPOINT
  const icons = String(parseQuery(parsePath(event.path).search).icons || '').split(',')

  if (!collectionName) return createError({ status: 400, message: 'No collection specified' })
  if (!icons.length) return createError({ status: 400, message: 'No icons specified' })
  if (!collection && import.meta.dev && !warnOnceSet.has(collectionName) && apiEndPoint === DEFAULT_ENDPOINT) {
    consola.warn([
      `[Icon] Collection \`${collectionName}\` is not found locally`,
      `We suggest to install it via \`${getInstallCommand(`@iconify-json/${collectionName}`)}\` to provide the best end-user experience.`,
    ].join('\n'))
    warnOnceSet.add(collectionName)
  }

  if (collection) {
    const data = getIcons(
      collection,
      icons,
    )
    consola.debug(`[Icon] serving ${(icons).map(i => '`' + collectionName + ':' + i + '`').join(',')} from bundled collection`)
    return data
  }

  if (options.fallbackToApi === true || options.fallbackToApi === 'server-only') {
    const apiUrl = new URL(`./${collectionName}.json?icons=${icons.join(',')}`, apiEndPoint)
    consola.debug(`[Icon] fetching ${(icons).map(i => '`' + collectionName + ':' + i + '`').join(',')} from iconify api`)
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
    const icons = String(parseQuery(parsePath(event.path).search).icons || '').split(',')
    return `${collection}_${icons[0]}_${icons.length}_${hash(icons.join(','))}`
  },
  swr: true,
  maxAge: 60 * 60 * 24 * 7, // 1 week
})
