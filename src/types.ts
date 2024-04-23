import type { NuxtIconRuntimeOptions } from './schema-types'

export type { NuxtIconRuntimeOptions }

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
   * List of pre-compiled CSS classnames to be used for server-side CSS icon rendering
   */
  serverKnownCssClasses?: string[]
}

export interface ServerBundleOptions {
  /**
   * Iconify collection names to be bundled
   */
  collections?: string[]
}

declare module '@nuxt/schema' {
  interface NuxtHooks {
    'icon:serverKnownCssClasses'(selectors: string[]): void
  }
}
