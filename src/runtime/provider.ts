export type IconProvider = 'server' | 'iconify' | 'none'

export type IconProviderOption = IconProvider | { server: IconProvider, client: IconProvider } | undefined

/**
 * Resolve the `provider` option at build time.
 *
 * A missing value falls back to `fallback`, a string is kept as-is,
 * and the object form must define both `server` and `client`.
 */
export function normalizeProvider(provider: IconProviderOption, fallback: IconProvider): IconProvider | { server: IconProvider, client: IconProvider } {
  if (!provider)
    return fallback
  if (typeof provider === 'string')
    return provider
  if (!provider.server || !provider.client)
    throw new TypeError('`icon.provider` object must define both `server` and `client`, e.g. `{ server: \'server\', client: \'iconify\' }`.')
  return {
    server: provider.server,
    client: provider.client,
  }
}

/**
 * Get the provider used by the given side (SSR or browser).
 */
export function getSideProvider(provider: IconProviderOption, side: 'server' | 'client'): IconProvider | undefined {
  return typeof provider === 'object'
    ? provider?.[side]
    : provider
}

/**
 * Whether at least one side fetches icons from the local server handler.
 */
export function usesLocalApi(provider: IconProviderOption): boolean {
  return getSideProvider(provider, 'server') === 'server'
    || getSideProvider(provider, 'client') === 'server'
}
