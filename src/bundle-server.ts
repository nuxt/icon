import { addTemplate, logger } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import collectionNames from './collection-names'
import type { ModuleOptions, ResolvedServerBundleOptions, CustomCollection, ServerBundleOptions, NuxtIconRuntimeOptions } from './types'
import { discoverInstalledCollections, isFullCollectionExists, resolveCollection } from './collections'

async function resolveServerBundle(
  nuxt: Nuxt,
  options: ServerBundleOptions | Promise<ServerBundleOptions>,
  customCollections: CustomCollection[] = [],
): Promise<ResolvedServerBundleOptions> {
  const resolved = await options

  if (resolved.disabled && customCollections.length)
    logger.warn('Nuxt Icon server bundle is disabled, the custom collections will not be bundled.')

  if (resolved.disabled) {
    return {
      disabled: true,
      remote: false,
      collections: [],
    }
  }

  if (!resolved.collections)
    resolved.collections = resolved.remote
      ? collectionNames
      : await discoverInstalledCollections()

  return {
    disabled: false,
    remote: resolved.remote === true
      ? 'jsdelivr' // Default remote source
      : resolved.remote || false,

    collections: await Promise.all(([
      ...(resolved.collections || []),
      ...customCollections,
    ])
      .map(c => resolveCollection(nuxt, c))),
  }
}

export function registerServerBundle(
  options: ModuleOptions,
  nuxt: Nuxt,
  serverBundle: ModuleOptions['serverBundle'],
): void {
  // Bundle icons for server
  const bundle = resolveServerBundle(
    nuxt,
    (!serverBundle || options.provider !== 'server')
      ? { disabled: true }
      : typeof serverBundle === 'string'
        ? { remote: serverBundle === 'remote' }
        : serverBundle,
    options.customCollections,
  )

  const templateServer = addTemplate({
    filename: 'nuxt-icon-server-bundle.mjs',
    write: true,
    async getContents() {
      const {
        collections, remote,
      } = await bundle

      nuxt.options.appConfig.icon ||= {}
      const appIcons = nuxt.options.appConfig.icon as NuxtIconRuntimeOptions
      appIcons.collections ||= []
      for (const collection of collections) {
        const prefix = typeof collection === 'string' ? collection : collection.prefix
        if (!appIcons.collections.includes(prefix))
          appIcons.collections.push(prefix)
      }

      const isBundling = !nuxt.options.dev

      function getRemoteEndpoint(name: string) {
        if (typeof remote === 'function')
          return remote(name)

        switch (remote) {
          case 'jsdelivr':
            return `https://cdn.jsdelivr.net/npm/@iconify-json/${name}/icons.json`
          case 'unpkg':
            return `https://unpkg.com/@iconify-json/${name}/icons.json`
          case 'github-raw':
            return `https://raw.githubusercontent.com/iconify/icon-sets/master/json/${name}.json`
          default:
            throw new Error(`Unknown remote collection source: ${remote}`)
        }
      }

      const collectionsValues = collections.map((collection) => {
        if (typeof collection === 'string') {
          if (remote) {
            return `  '${collection}': createRemoteCollection(${JSON.stringify(getRemoteEndpoint(collection))}),`
          }

          const path = isFullCollectionExists
            ? `@iconify/json/json/${collection}.json`
            : `@iconify-json/${collection}/icons.json`

          // When in dev mode, we avoid bundling the icons to improve performance
          // Get rid of the require() when ESM JSON modules are widely supported
          return isBundling
            ? `  '${collection}': () => import('${path}', { with: { type: 'json' } }).then(m => m.default),`
            : `  '${collection}': () => require('${path}'),`
        }
        else {
          const { prefix } = collection
          if ('fetchEndpoint' in collection)
            return `  '${prefix}': createRemoteCollection(${JSON.stringify(collection.fetchEndpoint)}),`
          return `  '${prefix}': () => (${JSON.stringify(collection)}),`
        }
      })

      const lines = [
        ...(isBundling
          ? []
          : [
            `import { createRequire } from 'module'`,
            `const require = createRequire(import.meta.url)`,
            ]
        ),
        `function createRemoteCollection(fetchEndpoint) {`,
        '  let _cache',
        '  return async () => {',
        '    if (_cache)',
        '      return _cache',
        '    const res = await fetch(fetchEndpoint).then(r => r.json())',
        '    _cache = res',
        '    return res',
        '  }',
        '}',
        '',
        `export const collections = {`,
        ...collectionsValues,
        '}',
      ]

      return lines.join('\n')
    },
  })
  nuxt.options.nitro.alias ||= {}
  nuxt.options.nitro.alias['#nuxt-icon-server-bundle'] = templateServer.dst
}
