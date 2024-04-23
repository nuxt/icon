import { defineNuxtModule, addPlugin, addServerHandler, createResolver, addTemplate, addComponent, logger } from '@nuxt/kit'
import collectionsData from '@iconify/collections/collections.json'
import { addCustomTab } from '@nuxt/devtools-kit'
import { schema } from './schema'
import type { ModuleOptions, ServerBundleOptions } from './types'
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
    nuxt.options.appConfig.nuxtIcon = Object.assign(
      nuxt.options.appConfig.nuxtIcon || {},
      runtimeOptions,
    )

    // Define types for the app.config compatible with Nuxt Studio
    nuxt.hook('schema:extend', (schemas) => {
      schemas.push({
        appConfig: {
          nuxtIcon: schema,
        },
      })
    })

    // Bundle icons for server
    const bundle: ServerBundleOptions | Promise<ServerBundleOptions> = (!options.serverBundle || options.provider !== 'server')
      ? {}
      : (options.serverBundle === 'auto')
          ? discoverLocalCollections()
          : options.serverBundle
    const template = addTemplate({
      filename: 'nuxt-icon-server-bundle.mjs',
      write: true,
      async getContents() {
        const { collections = [] } = await bundle
        return [
          `export const collections = {`,
          ...collections.map(collection => `  '${collection}': () => import('@iconify-json/${collection}/icons.json').then(m => m.default),`),
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
    nuxt.options.runtimeConfig.nuxtIcon = {
      serverKnownCssClasses,
    }
    nuxt.hook('nitro:init', async (_nitro) => {
      _nitro.options.runtimeConfig.nuxtIcon = {
        serverKnownCssClasses,
      }
    })
    unocssIntegration(nuxt, options)
    await nuxt.callHook('icon:serverKnownCssClasses', serverKnownCssClasses)
  },
})

async function discoverLocalCollections(): Promise<ServerBundleOptions> {
  const isPackageExists = await import('local-pkg').then(r => r.isPackageExists)
  const collections = collectionNames
    .filter(collection => isPackageExists('@iconify-json/' + collection))
  if (collections.length)
    logger.success(`Nuxt Icon discovered local-installed ${collections.length} collections:`, collections.join(', '))
  return { collections }
}
