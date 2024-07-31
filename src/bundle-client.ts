import { addTemplate, logger } from '@nuxt/kit'
import type { IconifyIcon, IconifyJSON } from '@iconify/types'
import type { NuxtIconModuleContext } from './context'

export function registerClientBundle(
  ctx: NuxtIconModuleContext,
): void {
  const iconifyCollectionMap = new Map<string, Promise<IconifyJSON | undefined>>()

  const {
    includeCustomCollections = ctx.options.provider !== 'server',
  } = ctx.options.clientBundle || {}

  // Client bundle
  addTemplate({
    filename: 'nuxt-icon-client-bundle.mjs',
    write: true,
    async getContents() {
      const icons = [...ctx.options.clientBundle?.icons || []]

      let customCollections: IconifyJSON[] = []
      if (includeCustomCollections && ctx.options.customCollections?.length) {
        customCollections = await ctx.loadCustomCollection()
      }

      if (!icons.length && !customCollections.length)
        return 'export function init() {}'

      const { getIconData } = await import('@iconify/utils')
      const { loadCollectionFromFS } = await import('@iconify/utils/lib/loader/fs')

      const lines: string[] = []

      lines.push(
        'import { addIcon } from "@iconify/vue"',
        'let _initialized = false',
        'export function init() {',
        '  if (_initialized)',
        '    return',
      )

      lines.push(
        ...await Promise.all(icons.map(async (icon) => {
          const [prefix, name] = icon.split(':')
          if (!iconifyCollectionMap.has(prefix))
            iconifyCollectionMap.set(prefix, loadCollectionFromFS(prefix))

          let data: IconifyIcon | null = null
          const collection = await iconifyCollectionMap.get(prefix)
          if (collection)
            data = getIconData(collection, name)

          if (!data) {
            logger.error(`Nuxt Icon could not fetch the icon data for \`${icon}\``)
            return `  /* ${icon} failed to load */`
          }
          return `  addIcon('${icon}', ${JSON.stringify(data)})`
        })),
      )

      if (customCollections.length) {
        lines.push(
          '  // ===== Custom collections =====',
          ...customCollections.flatMap(collection => Object.entries(collection.icons).map(([name, data]) => {
            return `  addIcon('${collection.prefix}:${name}', ${JSON.stringify(data)})`
          })),
        )
      }

      lines.push(
        '  _initialized = true',
        '}',
      )

      return lines.join('\n')
    },
  })
}
