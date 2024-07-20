import { basename, join, isAbsolute } from 'node:path'
import fs from 'node:fs/promises'
import { defineNuxtModule, addPlugin, addServerHandler, hasNuxtModule, createResolver, addTemplate, addComponent, logger } from '@nuxt/kit'
import { addCustomTab } from '@nuxt/devtools-kit'
import type { Nuxt } from '@nuxt/schema'
import fg from 'fast-glob'
import { isPackageExists } from 'local-pkg'
import type { IconifyJSON } from '@iconify/types'
import { parseSVGContent, convertParsedSVG } from '@iconify/utils/lib/svg/parse'
import collectionNames from './collections'
import { schema } from './schema'
import type { ModuleOptions, ResolvedServerBundleOptions, CustomCollection, ServerBundleOptions, NuxtIconRuntimeOptions, RemoteCollection } from './types'
import { unocssIntegration } from './integrations/unocss'

export type { ModuleOptions }

const KEYWORDS_EDGE_TARGETS: string[] = [
  'edge',
  'cloudflare',
  'worker',
]

const isFullCollectionExists = isPackageExists('@iconify/json')

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@nuxt/icon',
    configKey: 'icon',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: {
    // Module options
    componentName: 'Icon',
    serverBundle: 'auto',
    serverKnownCssClasses: [],

    // Runtime options
    provider: schema['provider'].$default,
    class: schema['class'].$default,
    size: schema['size'].$default,
    aliases: schema['aliases'].$default,
    iconifyApiEndpoint: schema['iconifyApiEndpoint'].$default,
    localApiEndpoint: schema['localApiEndpoint'].$default,
    fallbackToApi: schema['fallbackToApi'].$default,
    cssSelectorPrefix: schema['cssSelectorPrefix'].$default,
    cssWherePseudo: schema['cssWherePseudo'].$default,
    cssLayer: schema['cssLayer'].$default,
    mode: schema['mode'].$default,
    attrs: schema['attrs'].$default,
    collections: schema['collections'].$default,
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    if (!options.provider)
      options.provider = nuxt.options.ssr ? 'server' : 'client'

    let serverBundle = options.serverBundle
    if (serverBundle === 'auto') {
      serverBundle = nuxt.options.dev
        ? 'local'
        : KEYWORDS_EDGE_TARGETS.some(word => typeof nuxt.options.nitro.preset === 'string' && nuxt.options.nitro.preset.includes(word))
          ? 'remote'
          : 'local'
      logger.info(`Nuxt Icon server bundle mode is set to \`${serverBundle}\``)
    }

    addPlugin(
      resolver.resolve('./runtime/plugin'),
    )
    addComponent({
      name: options.componentName || 'Icon',
      global: true,
      filePath: resolver.resolve('./runtime/components/index'),
    })
    addServerHandler({
      route: `${options.localApiEndpoint || '/api/_nuxt_icon'}/:collection`,
      handler: resolver.resolve('./runtime/server/api'),
    })

    // Merge options to app.config
    const runtimeOptions = Object.fromEntries(
      Object.entries(options)
        .filter(([key]) => key in schema),
    )
    if (!runtimeOptions.collections) {
      runtimeOptions.collections = runtimeOptions.fallbackToApi
        ? collectionNames
        : typeof serverBundle === 'string'
          ? collectionNames
          : serverBundle
            ? serverBundle.collections
            : []
    }
    nuxt.options.appConfig.icon = Object.assign(
      nuxt.options.appConfig.icon || {},
      runtimeOptions,
    )

    // Define types for the app.config compatible with Nuxt Studio
    nuxt.hook('schema:extend', (schemas) => {
      schemas.push({
        appConfig: {
          icon: schema,
        },
      })
    })

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

    const template = addTemplate({
      filename: 'nuxt-icon-server-bundle.mjs',
      write: true,
      async getContents() {
        const {
          collections,
          remote,
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
    nuxt.options.nitro.alias['#nuxt-icon-server-bundle'] = template.dst

    // Devtools
    addCustomTab({
      name: 'icones',
      title: 'Icônes',
      icon: 'https://icones.js.org/favicon.svg',
      view: {
        type: 'iframe',
        src: 'https://icones.js.org',
      },
    })

    // Server-only runtime config for known CSS selectors
    options.serverKnownCssClasses ||= []
    const serverKnownCssClasses = options.serverKnownCssClasses || []
    nuxt.options.runtimeConfig.icon = {
      serverKnownCssClasses,
    }
    nuxt.hook('nitro:init', async (_nitro) => {
      _nitro.options.runtimeConfig.icon = {
        serverKnownCssClasses,
      }
    })

    if (hasNuxtModule('@unocss/nuxt'))
      unocssIntegration(nuxt, options)

    await nuxt.callHook('icon:serverKnownCssClasses', serverKnownCssClasses)
  },
})

async function discoverLocalCollections(): Promise<ServerBundleOptions['collections']> {
  const collections = isFullCollectionExists
    ? collectionNames
    : collectionNames.filter(collection => isPackageExists('@iconify-json/' + collection))
  if (isFullCollectionExists)
    logger.success(`Nuxt Icon discovered local-installed ${collections.length} collections (@iconify/json)`)
  else if (collections.length)
    logger.success(`Nuxt Icon discovered local-installed ${collections.length} collections:`, collections.join(', '))
  return collections
}

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
      : await discoverLocalCollections()

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

async function resolveCollection(
  nuxt: Nuxt,
  collection: string | IconifyJSON | CustomCollection | RemoteCollection,
): Promise<string | IconifyJSON | RemoteCollection> {
  if (typeof collection === 'string')
    return collection
  // Custom collection
  if ('dir' in collection) {
    const dir = isAbsolute(collection.dir) ? collection.dir : join(nuxt.options.rootDir, collection.dir)
    const files = (await fg('*.svg', { cwd: dir, onlyFiles: true }))
      .sort()

    const parsedIcons = await Promise.all(files.map(async (file) => {
      const name = basename(file, '.svg')
      let svg = await fs.readFile(join(dir, file), 'utf-8')
      const cleanupIdx = svg.indexOf('<svg')
      if (cleanupIdx > 0)
        svg = svg.slice(cleanupIdx)
      const data = convertParsedSVG(parseSVGContent(svg)!)
      if (!data) {
        logger.error(`Nuxt Icon could not parse the SVG content for icon \`${name}\``)
        return [name, {}]
      }
      if (data.top === 0)
        delete data.top
      if (data.left === 0)
        delete data.left
      return [name, data]
    }))

    const successfulIcons = parsedIcons.filter(([_, data]) => Object.keys(data).length > 0)
    // @ts-expect-error remove extra properties
    delete collection.dir

    logger.success(`Nuxt Icon loaded local collection \`${collection.prefix}\` with ${successfulIcons.length} icons`)
    return {
      ...collection,
      icons: Object.fromEntries(successfulIcons),
    }
  }
  return collection
}
