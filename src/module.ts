import { basename, join } from 'node:path'
import fs from 'node:fs/promises'
import { defineNuxtModule, addPlugin, addServerHandler, createResolver, addTemplate, addComponent, logger } from '@nuxt/kit'
import collectionsData from '@iconify/collections/collections.json' with { type: 'json' }
import { addCustomTab } from '@nuxt/devtools-kit'
import type { Nuxt } from '@nuxt/schema'
import fg from 'fast-glob'
import type { IconifyIcon, IconifyJSON } from '@iconify/types'
import { schema } from './schema'
import type { ModuleOptions, ResolvedServerBundleOptions, CustomCollection, ServerBundleOptions, NuxtIconRuntimeOptions } from './types'
import { unocssIntegration } from './integrations/unocss'

export type { ModuleOptions }

const collectionNames = Object.keys(collectionsData)

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-icon',
    configKey: 'icon',
    compatibility: {
      nuxt: '^3.0.0',
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
    fallbackToApi: schema['fallbackToApi'].$default,
    cssSelectorPrefix: schema['cssSelectorPrefix'].$default,
    cssWherePseudo: schema['cssWherePseudo'].$default,
    cssLayer: schema['cssLayer'].$default,
    defaultMode: schema['defaultMode'].$default,
    collections: schema['collections'].$default,
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    addPlugin(
      resolver.resolve('./runtime/plugin'),
    )
    addComponent({
      name: options.componentName || 'Icon',
      global: true,
      filePath: resolver.resolve('./runtime/components/index'),
    })
    addServerHandler({
      route: '/api/_nuxt_icon/:collection',
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
        : options.serverBundle === 'auto'
          ? collectionNames
          : options.serverBundle
            ? options.serverBundle.collections
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
      (!options.serverBundle || options.provider !== 'server')
        ? {}
        : (options.serverBundle === 'auto')
            ? discoverLocalCollections()
            : options.serverBundle,
      options.customCollections,
    )

    const template = addTemplate({
      filename: 'nuxt-icon-server-bundle.mjs',
      write: true,
      async getContents() {
        const { collections } = await bundle

        nuxt.options.appConfig.icon ||= {}
        const appIcons = nuxt.options.appConfig.icon as NuxtIconRuntimeOptions
        appIcons.collections ||= []
        for (const collection of collections) {
          const prefix = typeof collection === 'string' ? collection : collection.prefix
          if (!appIcons.collections.includes(prefix))
            appIcons.collections.push(prefix)
        }

        return [
          `export const collections = {`,
          ...collections.map(collection => typeof collection === 'string'
            ? `  '${collection}': () => import('@iconify-json/${collection}/icons.json').then(m => m.default),`
            : `  '${collection.prefix}': () => (${JSON.stringify(collection)}),`),
          `}`,
        ].join('\n')
      },
    })
    nuxt.options.nitro.alias ||= {}
    nuxt.options.nitro.alias['#nuxt-icon-server-bundle'] = template.dst
    nuxt.options.build.transpile ||= []
    nuxt.options.build.transpile.push(template.dst)

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

    if (hasModule(nuxt, '@unocss/nuxt'))
      unocssIntegration(nuxt, options)

    await nuxt.callHook('icon:serverKnownCssClasses', serverKnownCssClasses)
  },
})

function hasModule(nuxt: Nuxt, name: string) {
  return nuxt.options.modules.some(i => Array.isArray(i) ? i[0] === name : i === name)
}

async function discoverLocalCollections(): Promise<ServerBundleOptions> {
  const isPackageExists = await import('local-pkg').then(r => r.isPackageExists)
  const collections = collectionNames
    .filter(collection => isPackageExists('@iconify-json/' + collection))
  if (collections.length)
    logger.success(`Nuxt Icon discovered local-installed ${collections.length} collections:`, collections.join(', '))
  return { collections }
}

export async function resolveServerBundle(
  nuxt: Nuxt,
  options: ServerBundleOptions | Promise<ServerBundleOptions>,
  customCollections: CustomCollection[] = [],
): Promise<ResolvedServerBundleOptions> {
  const resolved = await options
  return {
    collections: await Promise.all(([...(resolved.collections || []), ...customCollections])
      .map(c => resolveCollection(nuxt, c))),
  }
}

async function resolveCollection(nuxt: Nuxt, collection: string | IconifyJSON | CustomCollection): Promise<string | IconifyJSON> {
  if (typeof collection === 'string')
    return collection
  // Custom collection
  if ('dir' in collection) {
    const dir = join(nuxt.options.rootDir, collection.dir)
    const files = (await fg('*.svg', { cwd: dir, onlyFiles: true }))
      .sort()

    const json: IconifyJSON = {
      ...collection,
      icons: Object.fromEntries(await Promise.all(files.map(async (file) => {
        const name = basename(file, '.svg')
        let svg = await fs.readFile(join(dir, file), 'utf-8')
        const cleanupIdx = svg.indexOf('<svg')
        if (cleanupIdx > 0)
          svg = svg.slice(cleanupIdx)
        return [name, { body: svg } satisfies IconifyIcon]
      }))),
    }
    // @ts-expect-error remove extra properties
    delete json.dir

    logger.success(`Nuxt Icon loaded local colllection \`${json.prefix}\` with ${files.length} icons`)
    return json
  }
  return collection
}
