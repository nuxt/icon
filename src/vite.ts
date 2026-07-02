import { relative } from 'node:path'
import type { Plugin, ViteDevServer } from 'vite'
import type { IconifyJSON } from '@iconify/types'
import { consola } from 'consola'
import { IconUsageScanner } from './core/scan'
import { loadCustomCollection } from './core/collections'
import { resolveBundleIcons, generateClientBundleCode } from './core/bundle'
import type { ClientBundleScanOptions, CustomCollection } from './core/types'

export type {
  ClientBundleScanOptions,
  CustomCollection,
}

export interface NuxtIconVitePluginOptions {
  /**
   * List of icons to be bundled, each icon should be formatted as `prefix:icon`
   * (a leading `i-`/`i:` is stripped, e.g. `i-lucide:heart` works too).
   *
   * Unlike scanned icons, icons listed here hard-fail the build when they
   * cannot be resolved from the locally installed `@iconify-json/*` packages.
   */
  icons?: string[]
  /**
   * Scan source files for icon usages and bundle them as well.
   *
   * Unlike the Nuxt module (where the `<Icon>` component can fall back to a
   * server endpoint), bundling is the whole point of this plugin, so scanning
   * is enabled by default.
   *
   * @default true
   */
  scan?: boolean | ClientBundleScanOptions
  /**
   * Custom icon collections: either inline `IconifyJSON` data or a directory
   * of SVG files (`{ prefix, dir }`).
   */
  customCollections?: (CustomCollection | IconifyJSON)[]
  /**
   * Bundle every icon of `customCollections`, on top of the requested icons.
   *
   * @default true
   */
  includeCustomCollections?: boolean
  /**
   * Size limit of the icon bundle in KB, uncompressed.
   * When exceeded, this will prevent the build process from continuing.
   * Set to `0` to disable the size limit check.
   *
   * @default 256
   */
  sizeLimitKb?: number
  /**
   * Directory to scan source files from, and to resolve `@iconify-json/*`
   * packages and custom collections against.
   *
   * @default Vite's resolved `config.root`
   */
  cwd?: string
}

export const BUNDLE_MODULE_ID = 'virtual:nuxt-icon-bundle'
export const REGISTER_MODULE_ID = 'virtual:nuxt-icon-bundle/register'

const RESOLVED_BUNDLE_MODULE_ID = '\0' + BUNDLE_MODULE_ID
const RESOLVED_REGISTER_MODULE_ID = '\0' + REGISTER_MODULE_ID

const logger = consola.withTag('nuxt:icon')

/**
 * Standalone Vite plugin that bundles Iconify icons into the client build for
 * plain Vue/Vite apps (no Nuxt required), so icons render offline and during
 * SSR without requests to the Iconify API.
 *
 * It exposes two virtual modules:
 *
 * - `virtual:nuxt-icon-bundle` exports `init(addIcon)`, for integrations that
 *   want to register the bundled icons on their own copy of `@iconify/vue`
 *   (or any compatible icon store).
 * - `virtual:nuxt-icon-bundle/register` is a side-effect module that registers
 *   the bundled icons on `@iconify/vue` — just `import 'virtual:nuxt-icon-bundle/register'`
 *   in your entry file.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from 'vite'
 * import { NuxtIconBundle } from '@nuxt/icon/vite'
 *
 * export default defineConfig({
 *   plugins: [NuxtIconBundle({ icons: ['lucide:heart'] })],
 * })
 * ```
 */
export function NuxtIconBundle(options: NuxtIconVitePluginOptions = {}): Plugin {
  const {
    icons = [],
    scan = true,
    includeCustomCollections = true,
    sizeLimitKb = 256,
  } = options

  let root = options.cwd || process.cwd()
  let isDev = false
  let server: ViteDevServer | undefined
  let scanner: IconUsageScanner | undefined
  let scanned = false
  const scannedIcons = new Set<string>()
  let customCollections: Promise<IconifyJSON[]> | undefined

  function loadCustomCollections(): Promise<IconifyJSON[]> {
    customCollections ||= Promise.all(
      (options.customCollections || [])
        .map(collection => loadCustomCollection(collection, root)),
    )
    return customCollections
  }

  return {
    name: 'nuxt-icon:bundle',

    configResolved(config) {
      root = options.cwd || config.root
      isDev = config.command === 'serve'
    },

    configureServer(_server) {
      server = _server
    },

    resolveId(id) {
      if (id === BUNDLE_MODULE_ID)
        return RESOLVED_BUNDLE_MODULE_ID
      if (id === REGISTER_MODULE_ID)
        return RESOLVED_REGISTER_MODULE_ID
    },

    async load(id) {
      if (id === RESOLVED_REGISTER_MODULE_ID) {
        return [
          `import { addIcon } from '@iconify/vue'`,
          `import { init } from ${JSON.stringify(BUNDLE_MODULE_ID)}`,
          `init(addIcon)`,
        ].join('\n')
      }

      if (id !== RESOLVED_BUNDLE_MODULE_ID)
        return

      const collections = await loadCustomCollections()

      if (scan && !scanner) {
        const additionalCollections = collections.map(c => c.prefix)
        const scanOptions = scan === true ? { additionalCollections } : { additionalCollections, ...scan }
        scanner = new IconUsageScanner(scanOptions)
      }
      if (scanner && !scanned) {
        await scanner.scanFiles(root, scannedIcons)
        scanned = true
      }

      const { collections: resolved, count, failed } = await resolveBundleIcons({
        icons,
        scannedIcons,
        customCollections: collections,
        includeCustomCollections,
        resolvePaths: [root],
      })

      if (failed.length) {
        const msg = `Nuxt Icon could not fetch the icon data for bundling:\n${failed.map(f => ' - ' + f).join('\n')}`
        if (isDev)
          logger.warn(msg)
        else
          throw new Error(msg)
      }

      const { code, bundleSizeKb } = generateClientBundleCode(resolved, { sizeLimitKb })

      if (resolved.length)
        logger.info(`Nuxt Icon bundled \`${count}\` icons with \`${bundleSizeKb.toFixed(2)}KB\`(uncompressed) in size`)

      return code
    },

    async handleHotUpdate({ file, read }) {
      if (!scanner || !server)
        return

      const path = relative(root, file)
      if (path.startsWith('..') || !scanner.isFileMatch(path))
        return

      const sizeBefore = scannedIcons.size
      scanner.extractFromCode(await read(), scannedIcons)
      if (scannedIcons.size === sizeBefore)
        return

      // A new icon usage appeared: regenerate the bundle module
      const mod = server.moduleGraph.getModuleById(RESOLVED_BUNDLE_MODULE_ID)
      if (mod) {
        server.moduleGraph.invalidateModule(mod)
        await server.reloadModule(mod)
      }
    },
  }
}

export default NuxtIconBundle
