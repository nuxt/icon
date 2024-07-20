import type { IconifyJSON } from '@iconify/types'
import type { NuxtIconRuntimeOptions } from './schema-types'

export type { NuxtIconRuntimeOptions }

export type IconifyIconCustomiseCallback = (
  content: string,
  name: string,
  prefix: string,
  provider: string
) => string

export interface NuxtIconRuntimeServerOptions {
  /**
   * List of pre-compiled CSS classnames to be used for server-side CSS icon rendering
   */
  serverKnownCssClasses?: string[]
}

export interface ModuleOptions extends Partial<NuxtIconRuntimeOptions> {
  /**
   * Name of the component to be registered
   * @default 'Icon'
   */
  componentName?: string

  /**
   * Bundle icons for server to serve icons
   *
   * - `auto`: Auto-discover all `@iconify-json/*` collections installed locally
   * - `{ collections: string[] }`: Specify collections to bundle
   */
  serverBundle?: 'auto' | false | ServerBundleOptions

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

export interface ServerBundleOptions {
  /**
   * Iconify collection names to be bundled
   */
  collections?: (string | CustomCollection | IconifyJSON)[]
}

export interface ResolvedServerBundleOptions {
  collections: (string | IconifyJSON)[]
}

declare module '@nuxt/schema' {
  interface NuxtHooks {
    'icon:serverKnownCssClasses'(selectors: string[]): void
  }
}
