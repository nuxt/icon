import type { Nuxt } from 'nuxt/schema'
import type { IconifyJSON } from '@iconify/types'
import collectionNames from './collection-names'
import type { ModuleOptions, NuxtIconRuntimeOptions, ResolvedServerBundleOptions } from './types'
import { discoverInstalledCollections, loadCustomCollection, resolveCollection } from './collections'

const KEYWORDS_EDGE_TARGETS: string[] = [
  'edge',
  'cloudflare',
  'worker',
]

export class NuxtIconModuleContext {
  public serverBundle: Exclude<ModuleOptions['serverBundle'], 'auto'>

  constructor(
    public readonly nuxt: Nuxt,
    public readonly options: ModuleOptions,
  ) {
    if (options.serverBundle === 'auto') {
      this.serverBundle = nuxt.options.dev
        ? 'local'
        : KEYWORDS_EDGE_TARGETS.some(word =>
          (typeof nuxt.options.nitro.preset === 'string' && nuxt.options.nitro.preset.includes(word))
          || process.env.NITRO_PRESET?.includes(word)
          || process.env.SERVER_PRESET?.includes(word),
        )
          ? 'remote'
          : 'local'
    }
    else {
      this.serverBundle = options.serverBundle
    }
  }

  getRuntimeCollections(runtimeOptions: NuxtIconRuntimeOptions): string[] {
    return runtimeOptions.fallbackToApi
      ? collectionNames
      : typeof this.serverBundle === 'string'
        ? collectionNames
        : this.serverBundle
          ? this.serverBundle.collections
            ?.map(c => typeof c === 'string' ? c : c.prefix) || []
          : []
  }

  async resolveServerBundle(): Promise<ResolvedServerBundleOptions> {
    const resolved = (!this.serverBundle || this.options.provider !== 'server')
      ? { disabled: true }
      : typeof this.serverBundle === 'string'
        ? { remote: this.serverBundle === 'remote' }
        : this.serverBundle

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

    const collections = await Promise.all(
      (resolved.collections || [])
        .map(c => resolveCollection(this.nuxt, c)),
    )

    return {
      disabled: false,
      remote: resolved.remote === true
        ? 'jsdelivr' // Default remote source
        : resolved.remote || false,

      collections: [
        ...collections,
        ...await this.loadCustomCollection(),
      ],
    }
  }

  private _customCollections: IconifyJSON[] | Promise<IconifyJSON[]> | undefined

  async loadCustomCollection(force = false): Promise<IconifyJSON[]> {
    if (force) {
      this._customCollections = undefined
    }
    if (!this._customCollections) {
      this._customCollections = Promise.all(
        (this.options.customCollections || [])
          .map(collection => loadCustomCollection(collection, this.nuxt)),
      )
        .then((collections) => {
          if (this._customCollections)
            this._customCollections = collections
          return collections
        })
    }
    return this._customCollections
  }
}
