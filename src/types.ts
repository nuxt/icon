import type { IconifyJSON } from '@iconify/types'
import type { NuxtIconRuntimeOptions } from './schema-types'
import type { ClientBundleOptions, CustomCollection, ServerBundleOptions } from './core/types'

export type {
  ClientBundleOptions,
  ClientBundleScanOptions,
  CustomCollection,
  RemoteCollection,
  RemoteCollectionSource,
  ResolvedServerBundleOptions,
  ServerBundleOptions,
} from './core/types'

export type { NuxtIconRuntimeOptions }

export interface NuxtIconRuntimeServerOptions {
  /**
   * List of pre-compiled CSS classnames to be used for server-side CSS icon rendering
   */
  serverKnownCssClasses?: string[]
}

export interface ModuleOptions extends Partial<Omit<NuxtIconRuntimeOptions, 'customize' | 'customCollections'>> {
  /**
   * Name of the component to be registered
   * @default 'Icon'
   */
  componentName?: string

  /**
   * Bundle icons for server to serve icons
   *
   * - `auto`: `local` when deploy to hosted platform, `remote` for edge workers
   * - `local`: Auto-discover all `@iconify-json/*` collections installed locally
   * - `remote`: Fetch collections from remote CDN. Same as `{ remote: true }`
   * - `{ collections: string[] }`: Specify collections to bundle
   *
   * @default 'auto'
   */
  serverBundle?: 'auto' | 'remote' | 'local' | false | ServerBundleOptions

  /**
   * Bundle icons into client-side.
   */
  clientBundle?: ClientBundleOptions

  /**
   * Custom icon collections
   */
  customCollections?: (CustomCollection | IconifyJSON)[]

  /**
   * List of pre-compiled CSS classnames to be used for server-side CSS icon rendering
   */
  serverKnownCssClasses?: string[]
}

declare module '@nuxt/schema' {
  interface NuxtHooks {
    'icon:serverKnownCssClasses'(selectors: string[]): void
    'icon:clientBundleIcons'(icons: Set<string>): void
  }
}
