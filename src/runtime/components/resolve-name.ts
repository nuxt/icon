import type { NuxtIconRuntimeOptions } from '../../types'

const HYPHEN = 45

const sortedCollectionsCache = new WeakMap<string[], string[]>()

export function getSortedCollections(collections: string[] | null | undefined): string[] {
  if (!collections)
    return []
  let sorted = sortedCollectionsCache.get(collections)
  if (!sorted || sorted.length !== collections.length) {
    sorted = [...collections].sort((a, b) => b.length - a.length)
    sortedCollectionsCache.set(collections, sorted)
  }
  return sorted
}

export function resolveName(name: string, options: Pick<NuxtIconRuntimeOptions, 'cssSelectorPrefix' | 'aliases' | 'collections'>): string {
  const bare = name.startsWith(options.cssSelectorPrefix)
    ? name.slice(options.cssSelectorPrefix.length)
    : name
  const resolved = options.aliases?.[bare] || bare

  // Disambiguate collection
  // e.g. `simple-icons-github` -> `simple-icons:github`
  if (!resolved.includes(':')) {
    const collection = getSortedCollections(options.collections)
      .find(c => resolved.charCodeAt(c.length) === HYPHEN && resolved.startsWith(c))
    return collection
      ? collection + ':' + resolved.slice(collection.length + 1)
      : resolved
  }
  return resolved
}
