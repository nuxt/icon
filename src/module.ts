import fs from 'node:fs/promises'
import { defineNuxtModule, addPlugin, addServerHandler, hasNuxtModule, createResolver, addComponent, logger, updateTemplates, resolvePath as nuxtResolvePath, addVitePlugin } from '@nuxt/kit'
import { addCustomTab } from '@nuxt/devtools-kit'
import { resolvePath } from 'mlly'
import type { ViteDevServer } from 'vite'
import type { Nuxt } from '@nuxt/schema'
import { schema } from './schema'
import type { ModuleOptions, NuxtIconRuntimeOptions } from './types'
import { unocssIntegration } from './integrations/unocss'
import { registerServerBundle } from './bundle-server'
import { registerClientBundle } from './bundle-client'
import { NuxtIconModuleContext } from './context'
import { getCollectionPath } from './collections'

export type { ModuleOptions, NuxtIconRuntimeOptions as RuntimeOptions }

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@nuxt/icon',
    configKey: 'icon',
    compatibility: {
      nuxt: '>=4.0.0',
    },
  },
  defaults: {
    // Module options
    componentName: 'Icon',
    serverBundle: 'auto',
    serverKnownCssClasses: [],
    clientBundle: {
      icons: [],
    },

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
    fetchTimeout: schema['fetchTimeout'].$default,
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // @ts-expect-error `customize` is not allowed in module options
    if (typeof options.customize === 'function') {
      throw new TypeError('`customize` callback cannot be set in module options, use `app.config.ts` or component props instead.')
    }

    // Use `server` provider when SSR is disabled or generate mode
    if (!options.provider) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options.provider = (!nuxt.options.ssr || nuxt.options.nitro.static || (nuxt.options as any)._generate)
        ? 'iconify'
        : 'server'
    }

    // In some monorepo, `@iconify/vue` might be bundled twice which does not share the loaded data
    nuxt.options.vite ||= {}
    nuxt.options.vite.resolve ||= {}
    nuxt.options.vite.resolve.dedupe ||= []
    nuxt.options.vite.resolve.dedupe.push('@iconify/vue')

    // Create context
    const ctx = new NuxtIconModuleContext(nuxt, options)

    addPlugin(
      resolver.resolve('./runtime/plugin'),
    )
    addComponent({
      name: options.componentName || 'Icon',
      global: true,
      filePath: await resolver.resolvePath('./runtime/components/index'),
    })
    addServerHandler({
      route: `${options.localApiEndpoint || '/api/_nuxt_icon'}/:collection`,
      handler: resolver.resolve('./runtime/server/api'),
    })

    await setupCustomCollectionsWatcher(options, nuxt, ctx)

    // Merge options to app.config
    const runtimeOptions = Object.fromEntries(
      Object.entries(options)
        .filter(([key]) => key in schema),
    ) as NuxtIconRuntimeOptions
    if (!runtimeOptions.collections) {
      runtimeOptions.collections = ctx.getRuntimeCollections(runtimeOptions)
    }
    nuxt.options.appConfig.icon = Object.assign(
      nuxt.options.appConfig.icon || {},
      runtimeOptions,
      {
        customCollections: options.customCollections?.map(i => i.prefix),
      },
    )
    // Define types for the app.config compatible with Nuxt Studio
    nuxt.hook('schema:extend', (schemas) => {
      schemas.push({
        appConfig: {
          icon: schema,
        },
      })
    })

    nuxt.hook('nitro:config', async (nitroConfig) => {
      ctx.setNitroPreset(nitroConfig.preset as string)
      const bundle = await ctx.resolveServerBundle()
      if (bundle.remote || !bundle.externalizeIconsJson)
        return

      logger.warn('Nuxt Icon\'s `serverBundle.externalizeIconsJson` is an experimental feature, it requires that your production Node.js server is able to import JSON modules.')

      const collections = bundle.collections
        .filter(collection => typeof collection === 'string')
        .map(collection => getCollectionPath(collection))
      const resolvedPaths = await Promise.all(
        collections.map(collection => resolvePath(collection, {
          url: nuxt.options.rootDir,
        })))

      // Trace iconify-json modules
      nitroConfig.externals ||= {}
      nitroConfig.externals.traceInclude ||= []
      nitroConfig.externals.traceInclude.push(...resolvedPaths)

      // Add rollup plugin to externalize iconify-json
      nitroConfig.rollupConfig ||= {}
      nitroConfig.rollupConfig.plugins ||= [];
      (nitroConfig.rollupConfig.plugins as unknown[]).unshift({
        name: '@nuxt/icon:rollup',
        resolveId(id: string) {
          if (id.match(/(?:[\\/]|^)(@iconify-json[\\/]|@iconify[\\/]json)/)) {
            return { id, external: true }
          }
        },
      })
    })

    registerServerBundle(ctx)
    registerClientBundle(ctx)

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

async function setupCustomCollectionsWatcher(options: ModuleOptions, nuxt: Nuxt, ctx: NuxtIconModuleContext) {
  if (!options.customCollections?.length)
    return

  let viteDevServer: ViteDevServer
  const collectionDirs = await Promise.all(options.customCollections.filter(x => 'dir' in x).map(x => nuxtResolvePath(x.dir)))

  if (options.clientBundle?.includeCustomCollections) {
    addVitePlugin({
      name: 'nuxt-icon/client-bundle-updater',
      apply: 'serve',
      configureServer(server) {
        viteDevServer = server
      },
    })
  }

  nuxt.hook('builder:watch', async (event, path) => {
    const resolvedPath = await nuxtResolvePath(path)

    if (ctx.scanner) {
      const matched = ctx.scanner.isFileMatch(path)
      console.log({ path, matched })
      ctx.scanner.extractFromCode(
        await fs.readFile(resolvedPath, 'utf-8').catch(() => ''),
        ctx.scannedIcons,
      )
    }

    if (collectionDirs.some(cd => resolvedPath.startsWith(cd))) {
      await ctx.loadCustomCollection(true) // Force re-read icons from fs

      // Update client and server bundles
      await updateTemplates({
        filter: template => template.filename.startsWith('nuxt-icon-'),
      })

      if (viteDevServer) {
        // Invalidate client bundle in vite dev server cache
        const nuxtIconClientBundleModule = await viteDevServer.moduleGraph.getModuleByUrl('/.nuxt/nuxt-icon-client-bundle.mjs')
        if (nuxtIconClientBundleModule) {
          viteDevServer.moduleGraph.invalidateModule(nuxtIconClientBundleModule)
          await viteDevServer.reloadModule(nuxtIconClientBundleModule)
        }
      }
    }
  })
}
