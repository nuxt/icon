import { relative } from 'node:path'
import { addTemplate } from '@nuxt/kit'
import { resolveModule } from 'local-pkg'
import type { NuxtIconRuntimeOptions } from './types'
import { getResolvePaths } from './collections'
import { getCollectionPath, resolveCollectionFile } from './core/collections'
import type { NuxtIconModuleContext } from './context'

export function registerServerBundle(
  ctx: NuxtIconModuleContext,
): void {
  const { nuxt } = ctx

  // Bundle icons for server
  const templateServer = addTemplate({
    filename: 'nuxt-icon-server-bundle.mjs',
    write: true,
    async getContents() {
      const { collections, remote } = await ctx.resolveServerBundle()

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

          const resolvePaths = getResolvePaths(nuxt)
          const path = getCollectionPath(collection, resolvePaths)

          if (!isBundling) {
            // When in dev mode, we avoid bundling the icons to improve performance
            // Get rid of the require() when ESM JSON modules are widely supported
            return `  '${collection}': () => require('${path}'),`
          }

          // A collection owned by a layer does not resolve from the app, so the bare specifier above
          // reaches the build unresolved and throws at runtime. Import the resolved file instead
          const file = resolveModule(path, { paths: [nuxt.options.rootDir] })
            ? undefined
            : resolveCollectionFile(collection, resolvePaths)
          if (file) {
            const relPath = relative(nuxt.options.buildDir, file).replaceAll('\\', '/')
            return `  '${collection}': () => import('${relPath.startsWith('.') ? relPath : `./${relPath}`}').then(m => m.default),`
          }

          return `  '${collection}': () => import('${path}', { with: { type: 'json' } }).then(m => m.default),`
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
              `import { createRequire } from 'node:module'`,
              `const require = createRequire(import.meta.url)`,
            ]
        ),
        `function createRemoteCollection(fetchEndpoint) {`,
        '  let _cache',
        '  return async () => {',
        '    if (_cache)',
        '      return _cache',
        '    _cache = fetch(fetchEndpoint).then(r => r.json()).then((data) => {',
        '      _cache = data',
        '      return data',
        '    }).catch((error) => {',
        '      _cache = undefined',
        '      throw error',
        '    })',
        '    return _cache',
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
