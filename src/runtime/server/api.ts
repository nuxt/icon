import { basename } from 'pathe'
import { getIcons } from '@iconify/utils'
import { consola } from 'consola'
import { useAppConfig, defineCachedEventHandler } from 'nitropack/runtime'
import type { NuxtIconRuntimeOptions } from '../../schema-types'
import { collections } from '#nuxt-icon-server-bundle'

const warnOnceSet = /* @__PURE__ */ new Set<string>()

export default defineCachedEventHandler(async (ctx) => {
  const url = ctx.node.req.url
  if (!url)
    return

  const options = useAppConfig().icon as NuxtIconRuntimeOptions
  const collectionName = ctx.context.params?.collection?.replace(/\.json$/, '')
  const collection = collectionName
    ? await collections[collectionName]?.()
    : null

  const apiUrl = new URL(basename(url), options.iconifyApiEndpoint || 'https://api.iconify.design')
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
    if (collectionName && !warnOnceSet.has(collectionName)) {
      consola.warn([
        `[Icon] Collection \`${collectionName}\` is not found locally`,
        `We suggest to install it via \`npm i -D @iconify-json/${collectionName}\` to provide the best end-user experience.`,
      ].join('\n'))
      warnOnceSet.add(collectionName)
    }
  }

  if (options.fallbackToApi) {
    consola.debug(`[Icon] fetching ${(icons || []).map(i => '`' + collectionName + ':' + i + '`').join(',')} from iconify api`)
    const data = await $fetch(apiUrl.href)
    return data
  }
})
