/**
 * Framework-agnostic utilities powering `@nuxt/icon`'s client bundle and the
 * standalone Vite plugin (`@nuxt/icon/vite`).
 *
 * These are exported so other integrations (e.g. `@nuxt/ui`'s Vite plugin) can
 * bundle Iconify icons at build time without duplicating the logic.
 */
export { IconUsageScanner, createMatchRegex } from './core/scan'
export {
  resolveBundleIcons,
  generateClientBundleCode,
} from './core/bundle'
export type {
  ResolveBundleIconsOptions,
  ResolvedBundleIcons,
  GenerateClientBundleOptions,
} from './core/bundle'
export {
  loadCustomCollection,
  discoverInstalledCollections,
  hasFullCollection,
  getCollectionPath,
  resolveCollection,
} from './core/collections'
export { collectionNames } from './collection-names'
export type {
  ClientBundleOptions,
  ClientBundleScanOptions,
  CustomCollection,
  RemoteCollection,
  RemoteCollectionSource,
  ServerBundleOptions,
} from './core/types'
