import { addTemplate, logger } from '@nuxt/kit'
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
      const { collections, count, failed } = await ctx.loadClientBundleCollections()

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

      if (!collections.length)
        return 'export function init() {}'

      const values = [...collections.values()]
      const valuesCompat = JSON.stringify(values)
      const bundleSizeKb = Buffer.byteLength(valuesCompat, 'utf-8') / 1024

      if (sizeLimitKb > 0) {
        if (bundleSizeKb > sizeLimitKb) {
          throw new Error(`Nuxt Icon client bundle size limit exceeded: \`${bundleSizeKb.toFixed(2)}KB\` > \`${sizeLimitKb}KB\``)
        }
        if (bundleSizeKb > sizeLimitKb * 0.75) {
          logger.warn(`Nuxt Icon client bundle size is close to the limit: \`${bundleSizeKb.toFixed(2)}KB\` -> \`${sizeLimitKb}KB\``)
        }
      }

      logger.info(`Nuxt Icon client bundle consist of \`${count}\` icons with \`${bundleSizeKb.toFixed(2)}KB\`(uncompressed) in size`)

      const collectionsRaw = `JSON.parse(${JSON.stringify(valuesCompat)})`

      cacheData = [
        'let _initialized = false',
        'export function init(addIcon) {',
        '  if (_initialized)',
        '    return',
        `  const collections = ${collectionsRaw}`,
        `  for (const collection of collections) {`,
        `    for (const [name, data] of Object.entries(collection.icons)) {`,
        `      addIcon(collection.prefix ? (collection.prefix + ':' + name) : name, data)`,
        `    }`,
        '  }',
        '  _initialized = true',
        '}',
      ].join('\n')
      cacheSize = count
      cacheVersion = ctx.clientBundleVersion
      return cacheData
    },
  })
}
