import { addTemplate, logger } from '@nuxt/kit'
import { generateClientBundleCode } from './core/bundle'
import type { NuxtIconModuleContext } from './context'

export function registerClientBundle(
  ctx: NuxtIconModuleContext,
): void {
  let cacheSize = 0
  let cacheVersion = -1
  let cacheData: string | null = null

  // Client bundle
  addTemplate({
    filename: 'nuxt-icon-client-bundle.mjs',
    write: true,
    async getContents() {
      const {
        sizeLimitKb = 256,
      } = ctx.options.clientBundle || {}

      // TODO: find a granular way to cache this
      const { collections, count, failed, dropped } = await ctx.loadClientBundleCollections()

      if (cacheSize === count && cacheData && cacheVersion === ctx.clientBundleVersion) {
        return cacheData
      }

      if (failed.length) {
        const msg = `Nuxt Icon could not fetch the icon data for client bundle:\n${failed.map(f => ' - ' + f).join('\n')}`
        if (!ctx.nuxt.options.dev)
          throw new Error(msg)
        else
          logger.warn(msg)
      }

      // `dropped` icons come from integrations via the `icon:clientBundleIcons` hook, not
      // from the user, so a warning is noise they can't act on. They already fall back to
      // runtime loading, so keep it at debug level for anyone inspecting the bundle.
      if (dropped.length) {
        logger.debug(`Nuxt Icon could not resolve these icons for the client bundle, falling back to runtime loading:\n${dropped.map(f => ' - ' + f).join('\n')}`)
      }

      const { code, bundleSizeKb } = generateClientBundleCode(collections, { sizeLimitKb })

      if (collections.length)
        logger.info(`Nuxt Icon client bundle consist of \`${count}\` icons with \`${bundleSizeKb.toFixed(2)}KB\`(uncompressed) in size`)

      cacheData = code
      cacheSize = count
      cacheVersion = ctx.clientBundleVersion
      return cacheData
    },
  })
}
