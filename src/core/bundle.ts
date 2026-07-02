import type { IconifyIcon, IconifyJSON } from '@iconify/types'
import { consola } from 'consola'

const logger = consola.withTag('nuxt:icon')

export interface ResolveBundleIconsOptions {
  /**
   * Icons explicitly requested, in `prefix:name` format (a leading `i-`/`i:` is stripped).
   *
   * Icons that cannot be resolved are reported in `failed`, callers are expected
   * to treat them as a hard error in production builds.
   */
  icons?: Iterable<string>
  /**
   * Icons detected by scanning source files (e.g. with `IconUsageScanner`).
   *
   * Since extraction can have false positives, icons that cannot be resolved are
   * silently skipped and fall back to runtime loading.
   */
  scannedIcons?: Iterable<string>
  /**
   * Icons contributed by integrations (e.g. through the `icon:clientBundleIcons` Nuxt hook).
   *
   * Icons that cannot be resolved are reported in `dropped` so integration authors
   * get a heads-up, but they do not fail the build and fall back to runtime loading.
   */
  extraIcons?: Iterable<string>
  /**
   * Already-loaded custom collections, taking priority over installed `@iconify-json/*` packages.
   */
  customCollections?: IconifyJSON[]
  /**
   * Bundle every icon of `customCollections`, on top of the requested icons.
   *
   * @default false
   */
  includeCustomCollections?: boolean
  /**
   * Directories used to resolve installed `@iconify-json/*` packages
   * (each is walked up like the Node.js module resolver).
   *
   * @default [process.cwd()]
   */
  resolvePaths?: string[]
}

export interface ResolvedBundleIcons {
  collections: IconifyJSON[]
  count: number
  failed: string[]
  dropped: string[]
}

function normalizeIconName(icon: string): string {
  return icon.replace(/^i[-:]/, '')
}

/**
 * Resolve icon data for a client bundle from locally installed `@iconify-json/*`
 * packages and custom collections. Framework-agnostic: used by the Nuxt module's
 * `clientBundle` and by the standalone Vite plugin.
 */
export async function resolveBundleIcons(options: ResolveBundleIconsOptions): Promise<ResolvedBundleIcons> {
  const {
    customCollections = [],
    includeCustomCollections = false,
    resolvePaths = [process.cwd()],
  } = options

  // Filter out the `i-` prefix and deduplicate
  const userIcons = new Set([...options.icons || []].map(normalizeIconName))
  const scannedIcons = new Set([...options.scannedIcons || []].map(normalizeIconName))
  const extraIcons = new Set([...options.extraIcons || []].map(normalizeIconName))

  const icons = new Set([...userIcons, ...scannedIcons, ...extraIcons])

  if (!icons.size && !customCollections.length) {
    return {
      count: 0,
      collections: [],
      failed: [],
      dropped: [],
    }
  }

  const iconifyCollectionMap = new Map<string, Promise<IconifyJSON | undefined>>()

  const { getIconData } = await import('@iconify/utils')
  const { loadCollectionFromFS } = await import('@iconify/utils/lib/loader/fs')

  const failed: string[] = []
  const dropped: string[] = []
  let count = 0

  const customCollectionNames = new Set(customCollections.map(c => c.prefix))
  const collections = new Map<string, IconifyJSON>()

  async function loadCollection(prefix: string): Promise<IconifyJSON | undefined> {
    if (customCollectionNames.has(prefix)) {
      const collection = customCollections.find(c => c.prefix === prefix)
      if (collection) {
        return collection
      }
    }

    for (const cwd of resolvePaths) {
      const collection = await loadCollectionFromFS(prefix, false, '@iconify-json', cwd)
      if (collection) {
        return collection
      }
    }
    return undefined
  }

  function addIcon(prefix: string, name: string, data: IconifyIcon) {
    let collection = collections.get(prefix)
    if (!collection) {
      collection = {
        prefix,
        icons: {},
      }
      collections.set(prefix, collection)
    }
    if (!collection.icons[name]) {
      count += 1
    }
    collection.icons[name] = data
  }

  function markUnresolved(icon: string) {
    // Only icons the caller explicitly listed hard-fail the build. Scanned and
    // integration-contributed icons are best-effort: drop them from the bundle
    // and fall back to runtime loading.
    if (userIcons.has(icon)) {
      failed.push(icon)
    }
    // We don't warn for scanned icons, because the extraction can have false
    // positives; contributed icons are surfaced so integration authors get a
    // heads-up that something couldn't be bundled.
    else if (!scannedIcons.has(icon)) {
      dropped.push(icon)
    }
  }

  await Promise.all([...icons].map(async (icon) => {
    try {
      const [prefix, name] = icon.split(':')
      if (prefix === undefined || name === undefined) {
        throw new Error(`Invalid icon ${icon}. Expected "prefix:name" format.`)
      }
      if (!iconifyCollectionMap.has(prefix))
        iconifyCollectionMap.set(prefix, loadCollection(prefix))

      let data: IconifyIcon | null = null
      const collection = await iconifyCollectionMap.get(prefix)
      if (collection)
        data = getIconData(collection, name)

      if (!data) {
        markUnresolved(icon)
      }
      else {
        addIcon(prefix, name, data)
      }
    }
    catch (e) {
      console.error(e)
      markUnresolved(icon)
    }
  }))

  if (includeCustomCollections && customCollections.length) {
    customCollections.flatMap(collection => Object.keys(collection.icons)
      .map((name) => {
        const data = getIconData(collection, name)
        if (data) {
          addIcon(collection.prefix, name, data)
        }
      }))
  }

  for (const collection of collections.values()) {
    const sortedEntries = Object.entries(collection.icons).sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
    collection.icons = Object.fromEntries(sortedEntries)
  }

  return {
    collections: [...collections.values()],
    count,
    failed,
    dropped,
  }
}

export interface GenerateClientBundleOptions {
  /**
   * Size limit of the generated bundle in KB, uncompressed.
   * When exceeded, an error is thrown to prevent the build from continuing.
   * Set to `0` to disable the size limit check.
   *
   * @default 256
   */
  sizeLimitKb?: number
}

/**
 * Generate the client bundle module code from resolved icon collections.
 *
 * The generated module exports `init(addIcon)`, which registers every bundled
 * icon through the passed `addIcon` (e.g. from `@iconify/vue`).
 */
export function generateClientBundleCode(
  collections: IconifyJSON[],
  options: GenerateClientBundleOptions = {},
): { code: string, bundleSizeKb: number } {
  const {
    sizeLimitKb = 256,
  } = options

  if (!collections.length) {
    return {
      code: 'export function init() {}',
      bundleSizeKb: 0,
    }
  }

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

  const collectionsRaw = `JSON.parse(${JSON.stringify(valuesCompat)})`

  const code = [
    'let _initialized = false',
    'export function init(addIcon) {',
    '  if (_initialized)',
    '    return',
    `  const collections = ${collectionsRaw}`,
    `  for (const collection of collections) {`,
    `    for (const [name, data] of Object.entries(collection.icons)) {`,
    `      addIcon(collection.prefix ? (collection.prefix + ':' + name) : name, data)`,
    `    }`,
    '  }',
    '  _initialized = true',
    '}',
  ].join('\n')

  return { code, bundleSizeKb }
}
