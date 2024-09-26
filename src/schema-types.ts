// This file is generated from scripts/schema.ts

import type { IconifyIconCustomizeCallback } from './types'

export interface NuxtIconRuntimeOptions {
  /**
   * Icon Size
   *
   * Set the default icon size.
   *
   */
  size: string | undefined

  /**
   * CSS Class
   *
   * Set the default CSS class.
   *
   * @default ""
   */
  class: string

  /**
   * Default Attributes
   *
   * Attributes applied to every icon component.
   *
   * @default { "aria-hidden": true }
   *
   */
  attrs: Record<string, string | number | boolean>

  /**
   * Default Rendering Mode
   *
   * Set the default rendering mode for the icon component
   *
   * @default "css"
   *
   * @enum css,svg
   */
  mode: string

  /**
   * Icon aliases
   *
   * Define Icon aliases to update them easily without code changes.
   *
   */
  aliases: { [alias: string]: string }

  /**
   * CSS Selector Prefix
   *
   * Set the default CSS selector prefix.
   *
   * @default "i-"
   */
  cssSelectorPrefix: string

  /**
   * CSS Layer Name
   *
   * Set the default CSS `@layer` name.
   *
   */
  cssLayer: string | undefined

  /**
   * Use CSS `:where()` Pseudo Selector
   *
   * Use CSS `:where()` pseudo selector to reduce specificity.
   *
   * @default true
   */
  cssWherePseudo: boolean

  /**
   * Icon Collections
   *
   * List of known icon collections name. Used to resolve collection name ambiguity.
   * e.g. `simple-icons-github` -> `simple-icons:github` instead of `simple:icons-github`
   *
   * When not provided, will use the full Iconify collection list.
   *
   */
  collections: string[] | null

  /**
   * Icon Provider
   *
   * Provider to use for fetching icons
   *
   * - `server` - Fetch icons with a server handler
   * - `iconify` - Fetch icons with Iconify API, purely client-side
   *
   * `server` by default; `iconify` when `ssr: false`
   *
   *
   * @enum server,iconify
   */
  provider: 'server' | 'iconify' | undefined

  /**
   * Iconify API Endpoint URL
   *
   * Define a custom Iconify API endpoint URL. Useful if you want to use a self-hosted Iconify API. Learn more: https://iconify.design/docs/api.
   *
   * @default "https://api.iconify.design"
   */
  iconifyApiEndpoint: string

  /**
   * Fallback to Iconify API
   *
   * Fallback to Iconify API if server provider fails to found the collection.
   *
   * @default true
   *
   * @enum true,false,server-only,client-only
   */
  fallbackToApi: boolean | 'server-only' | 'client-only'

  /**
   * Local API Endpoint Path
   *
   * Define a custom path for the local API endpoint.
   *
   * @default "/api/_nuxt_icon"
   */
  localApiEndpoint: string

  /**
   * Fetch Timeout
   *
   * Set the timeout for fetching icons.
   *
   * @default 500
   */
  fetchTimeout: number

  /**
   * Customize callback
   *
   * Customize icon content (replace stroke-width, colors, etc...).
   *
   */
  customize: IconifyIconCustomizeCallback
}
