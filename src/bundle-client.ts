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
      const { collections, failed } = await ctx.loadClientBundleCollections()

      if (failed.length) {
        const msg = `Nuxt Icon could not fetch the icon data for:\n${failed.map(f => ' - ' + f).join('\n')}`
        if (ctx.nuxt.options._build)
          throw new Error(msg)
        else
          logger.warn(msg)
      }

      if (!collections.length)
        return 'export function init() {}'

      const collectionsRaw = JSON.stringify([...collections.values()], null, 2)

      return [
        'import { addCollection } from "@iconify/vue"',
        'let _initialized = false',
        'export function init() {',
        '  if (_initialized)',
        '    return',
        `  const collections = ${collectionsRaw}`,
        `  for (const collection of collections) {`,
        '    addCollection(collection)',
        '  }',
        '  _initialized = true',
        '}',
      ].join('\n')
    },
  })
}
