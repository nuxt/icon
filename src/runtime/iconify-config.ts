import type { addAPIProvider, _api, setCustomIconsLoader, IconifyCustomIconsLoader } from '@iconify/vue'

export interface IconifyConfigTarget {
  addAPIProvider: typeof addAPIProvider
  _api: typeof _api
  setCustomIconsLoader: typeof setCustomIconsLoader
}

export interface IconifyConfig {
  /**
   * API endpoints of the default provider. When empty, the API is not used at all.
   */
  resources: string[]
  fetch: typeof globalThis.fetch
  customIconsLoader: IconifyCustomIconsLoader
  customCollections: string[]
}

const DEFAULT_RESOURCES = ['https://api.iconify.design']

let pending: IconifyConfig | undefined
let applied: IconifyConfig | undefined
let appliedFetch: unknown
let appliedProvider: unknown

/**
 * Register the Iconify API configuration, applied once `@iconify/vue` is loaded.
 */
export function setIconifyConfig(config: IconifyConfig) {
  pending = config
}

/**
 * Apply the registered configuration. On the client, a fetch function or default
 * provider that the app has already set on `@iconify/vue` is kept.
 */
export function applyIconifyConfig({ addAPIProvider, _api, setCustomIconsLoader }: IconifyConfigTarget) {
  if (!pending || applied === pending)
    return
  const config = applied = pending

  const fetch = _api.getFetch()
  if (import.meta.server || !config.resources.length || fetch === globalThis.fetch || fetch === appliedFetch) {
    _api.setFetch(config.fetch)
    appliedFetch = config.fetch
  }

  const provider = _api.getAPIConfig('')
  const isDefaultProvider = !provider || provider === appliedProvider
    || (provider.resources.length === DEFAULT_RESOURCES.length && provider.resources.every((r, i) => r === DEFAULT_RESOURCES[i]))
  if (config.resources.length && (import.meta.server || isDefaultProvider)) {
    addAPIProvider('', { resources: config.resources })
    appliedProvider = _api.getAPIConfig('')
  }

  for (const prefix of config.customCollections) {
    if (prefix)
      setCustomIconsLoader(config.customIconsLoader, prefix)
  }
}
