import type { IconifyJSON } from '@iconify/types'
import type { NuxtIconRuntimeOptions } from './schema-types'

export type { NuxtIconRuntimeOptions }

export type IconifyIconCustomizeCallback = (
  content: string,
  name?: string,
  prefix?: string,
  provider?: string
) => string

export interface NuxtIconRuntimeServerOptions {
  /**
   * List of pre-compiled CSS classnames to be used for server-side CSS icon rendering
   */
  serverKnownCssClasses?: string[]
}

export interface ModuleOptions extends Partial<Omit<NuxtIconRuntimeOptions, 'customize'>> {
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
  customCollections?: CustomCollection[]

  /**
   * List of pre-compiled CSS classnames to be used for server-side CSS icon rendering
   */
  serverKnownCssClasses?: string[]
}

export interface CustomCollection extends Pick<IconifyJSON, 'prefix' | 'width' | 'height'> {
  dir: string
}

export interface RemoteCollection {
  prefix: string
  fetchEndpoint: string
}

export type RemoteCollectionSource = 'github-raw' | 'jsdelivr' | 'unpkg' | ((name: string) => string)

export interface ServerBundleOptions {
  /**
   * Iconify collection names to be bundled
   */
  collections?: (string | CustomCollection | IconifyJSON | RemoteCollection)[]
  /**
   * Whether to bundle remote collections
   *
   * When set to `true`, `jsdelivr` will be used as the default remote source
   *
   * @default false
   */
  remote?: boolean | RemoteCollectionSource
  /**
   * Whether to disable server bundle
   */
  disabled?: boolean

  /**
   * External icon JSON files as in the final `node_modules`, instead of bundling them
   * This would likely improve the performance of bundling.
   * Enabling this option would requires your production Node.js server to be able to import JSON modules.
   *
   * @default false
   */
  externalizeIconsJson?: boolean
}

export interface ClientBundleOptions {
  /**
   * List of icons to be bundled, each icon should be in the formatted as `prefix:icon`
   */
  icons?: string[]
  /**
   * Bundle all custom collections into client-side
   *
   * Default to true when `provider` is not set to `server`
   */
  includeCustomCollections?: boolean
}

export interface ResolvedServerBundleOptions {
  disabled: boolean
  remote: RemoteCollectionSource | false
  collections: (string | IconifyJSON | RemoteCollection)[]
  externalizeIconsJson: boolean
}

declare module '@nuxt/schema' {
  interface NuxtHooks {
    'icon:serverKnownCssClasses'(selectors: string[]): void
  }
}
