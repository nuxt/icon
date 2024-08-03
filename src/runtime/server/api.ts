import { basename } from 'pathe'
import { getIcons } from '@iconify/utils'
import { consola } from 'consola'
import { useAppConfig, defineCachedEventHandler } from 'nitropack/runtime'
import { createError } from 'h3'
import type { NuxtIconRuntimeOptions } from '../../schema-types'
import { collections } from '#nuxt-icon-server-bundle'

const warnOnceSet = /* @__PURE__ */ new Set<string>()

const DEFAULT_ENDPOINT = 'https://api.iconify.design'

export default defineCachedEventHandler(async (ctx) => {
  const url = ctx.node.req.url
  if (!url)
    return

  const options = useAppConfig().icon as NuxtIconRuntimeOptions
  const collectionName = ctx.context.params?.collection?.replace(/\.json$/, '')
  const collection = collectionName
    ? await collections[collectionName]?.()
    : null

  const apiEndPoint = options.iconifyApiEndpoint || DEFAULT_ENDPOINT
  const apiUrl = new URL('./' + basename(url), apiEndPoint)
  const icons = apiUrl.searchParams.get('icons')?.split(',')

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

  if (options.fallbackToApi) {
    consola.debug(`[Icon] fetching ${(icons || []).map(i => '`' + collectionName + ':' + i + '`').join(',')} from iconify api`)
    if (apiUrl.host !== new URL(apiEndPoint).host) {
      return createError({ status: 400, message: 'Invalid icon request' })
    }
    const data = await $fetch(apiUrl.href)
    return data
  }
})
