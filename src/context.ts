import type { Nuxt } from 'nuxt/schema'
import type { IconifyIcon, IconifyJSON } from '@iconify/types'
import { provider } from 'std-env'
import { logger } from '@nuxt/kit'
import { collectionNames } from './collection-names'
import type { ModuleOptions, NuxtIconRuntimeOptions, ResolvedServerBundleOptions } from './types'
import { discoverInstalledCollections, loadCustomCollection, resolveCollection } from './collections'
import { IconUsageScanner } from './scan'

const KEYWORDS_EDGE_TARGETS: string[] = [
  'edge',
  'cloudflare',
  'worker',
]

export class NuxtIconModuleContext {
  constructor(
    public readonly nuxt: Nuxt,
    public readonly options: ModuleOptions,
  ) { }

  public clientBundleVersion = 0
  public scannedIcons = new Set<string>()
  public scanner: IconUsageScanner | undefined

  getRuntimeCollections(runtimeOptions: NuxtIconRuntimeOptions): string[] {
    const resolved = runtimeOptions.fallbackToApi
      ? collectionNames
      : typeof this.options.serverBundle === 'string'
        ? collectionNames
        : this.options.serverBundle
          ? this.options.serverBundle.collections
            ?.map(c => typeof c === 'string' ? c : c.prefix) || []
          : []

    // Include custom collections prefixes
    for (const collection of this.options.customCollections || []) {
      if (collection.prefix && !resolved.includes(collection.prefix))
        resolved.push(collection.prefix)
    }

    return resolved
  }

  private _customCollections: IconifyJSON[] | Promise<IconifyJSON[]> | undefined
  private _serverBundle: ResolvedServerBundleOptions | Promise<ResolvedServerBundleOptions> | undefined
  private _nitroPreset: string | undefined

  setNitroPreset(preset: string | undefined): void {
    this._nitroPreset = preset || this._nitroPreset
  }

  async resolveServerBundle(): Promise<ResolvedServerBundleOptions> {
    if (!this._serverBundle) {
      this._serverBundle = this._resolveServerBundle()
        .then((bundle) => {
          if (this._serverBundle)
            this._serverBundle = bundle
          return bundle
        })
    }
    return this._serverBundle
  }

  private async _resolveServerBundle(): Promise<ResolvedServerBundleOptions> {
    let serverBundle = this.options.serverBundle
    if (serverBundle === 'auto') {
      const preset = this._nitroPreset || (typeof this.nuxt.options.nitro.preset === 'string'
        ? this.nuxt.options.nitro.preset || provider
        : provider)

      serverBundle = 'local'

      if (!this.nuxt.options.dev && KEYWORDS_EDGE_TARGETS.some(
        word =>
          (typeof preset === 'string' && preset.includes(word))
          || process.env.NITRO_PRESET?.includes(word)
          || process.env.SERVER_PRESET?.includes(word),
      ))
        serverBundle = 'remote'

      logger.info(`Nuxt Icon server bundle mode is set to \`${serverBundle}\``)
    }

    const resolved = (!serverBundle || this.options.provider !== 'server')
      ? { disabled: true }
      : typeof serverBundle === 'string'
        ? { remote: serverBundle === 'remote' }
        : serverBundle

    if (resolved.disabled) {
      return {
        disabled: true,
        remote: false,
        externalizeIconsJson: false,
        collections: [],
      }
    }

    if (!resolved.collections)
      resolved.collections = resolved.remote
        ? collectionNames
        : await discoverInstalledCollections()

    const collections = await Promise.all(
      (resolved.collections || [])
        .map(c => resolveCollection(this.nuxt, c)),
    )

    return {
      disabled: false,
      remote: resolved.remote === true
        ? 'jsdelivr' // Default remote source
        : resolved.remote || false,
      externalizeIconsJson: !!resolved.externalizeIconsJson,
      collections: [
        ...collections,
        ...await this.loadCustomCollection(),
      ],
    }
  }

  async loadCustomCollection(force = false): Promise<IconifyJSON[]> {
    if (force) {
      this.clientBundleVersion += 1
      this._customCollections = undefined
    }
    if (!this._customCollections) {
      this._customCollections = this._loadCustomCollection()
        .then((collections) => {
          if (this._customCollections)
            this._customCollections = collections
          return collections
        })
    }
    return this._customCollections
  }

  private async _loadCustomCollection(): Promise<IconifyJSON[]> {
    return Promise.all(
      (this.options.customCollections || [])
        .map(collection => loadCustomCollection(collection, this.nuxt)),
    )
  }

  async loadClientBundleCollections(): Promise<{ collections: IconifyJSON[], count: number, failed: string[] }> {
    const {
      includeCustomCollections = this.options.provider !== 'server',
      scan = false,
    } = this.options.clientBundle || {}

    // Filter out the `i-` prefix and deduplicate
    const userIcons = new Set((this.options.clientBundle?.icons || []).map(i => i.replace(/^i[-:]/, '')))

    let customCollections: IconifyJSON[] = []
    if (this.options.customCollections?.length) {
      customCollections = await this.loadCustomCollection()
    }

    if (scan && !this.scanner) {
      const additionalCollections = customCollections.map(c => c.prefix)
      const scanOptions = scan === true ? { additionalCollections } : { additionalCollections, ...scan }
      this.scanner = new IconUsageScanner(scanOptions)
      await this.scanner.scanFiles(this.nuxt, this.scannedIcons)
    }

    const icons = new Set<string>([...userIcons, ...this.scannedIcons])

    await this.nuxt.callHook('icon:clientBundleIcons', icons)

    if (!icons.size && !customCollections.length) {
      return {
        count: 0,
        collections: [],
        failed: [],
      }
    }

    const iconifyCollectionMap = new Map<string, Promise<IconifyJSON | undefined>>()

    const { getIconData } = await import('@iconify/utils')
    const { loadCollectionFromFS } = await import('@iconify/utils/lib/loader/fs')

    const failed: string[] = []
    let count = 0

    const customCollectionNames = new Set(customCollections.map(c => c.prefix))
    const collections = new Map<string, IconifyJSON>()

    function loadCollection(prefix: string) {
      if (customCollectionNames.has(prefix)) {
        const collection = customCollections.find(c => c.prefix === prefix)
        if (collection) {
          return Promise.resolve(collection)
        }
      }

      return loadCollectionFromFS(prefix)
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
          // We don't warn for scanned icons, because the extraction can have false positives
          if (!this.scannedIcons.has(icon) || userIcons.has(icon)) {
            failed.push(icon)
          }
        }
        else {
          addIcon(prefix, name, data)
        }
      }
      catch (e) {
        console.error(e)
        failed.push(icon)
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

    return {
      collections: [...collections.values()],
      count,
      failed,
    }
  }
}
