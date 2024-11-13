import { addTemplate, logger } from '@nuxt/kit'
import type { NuxtIconModuleContext } from './context'

export function registerClientBundle(
  ctx: NuxtIconModuleContext,
): void {
  // Client bundle
  addTemplate({
    filename: 'nuxt-icon-client-bundle.mjs',
    write: true,
    async getContents() {
      const {
        sizeLimitKb = 256,
      } = ctx.options.clientBundle || {}

      const { collections, count, failed } = await ctx.loadClientBundleCollections()

      if (failed.length) {
        const msg = `Nuxt Icon could not fetch the icon data for client bundle:\n${failed.map(f => ' - ' + f).join('\n')}`
        if (ctx.nuxt.options._build)
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

      return [
        'import { addIcon } from "@iconify/vue"',
        'let _initialized = false',
        'export function init() {',
        '  if (_initialized)',
        '    return',
        `  const collections = ${collectionsRaw}`,
        `  for (const collection of collections) {`,
        `    for (const [name, data] of Object.entries(collection.icons)) {`,
        `      addIcon(collection.prefix ? collection.prefix + ':' + name : name, data)`,
        `    }`,
        '  }',
        '  _initialized = true',
        '}',
      ].join('\n')
    },
  })
}
