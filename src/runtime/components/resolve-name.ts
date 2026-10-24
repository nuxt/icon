import { toRaw } from 'vue'
import type { NuxtIconRuntimeOptions } from '../../types'

const HYPHEN = 45

const sortedCollectionsCache = new WeakMap<string[], { source: string[], sorted: string[] }>()

function isSameList(a: string[], b: string[]) {
  if (a.length !== b.length)
    return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i])
      return false
  }
  return true
}

export function getSortedCollections(collections: string[] | null | undefined): string[] {
  if (!collections)
    return []
  const source = toRaw(collections)
  const cached = sortedCollectionsCache.get(source)
  // App config is cloned per request on the server, but updated in place on the client (HMR, `updateAppConfig`)
  if (cached && (import.meta.client ? isSameList(cached.source, source) : cached.source.length === source.length))
    return cached.sorted
  const sorted = [...source].sort((a, b) => b.length - a.length)
  sortedCollectionsCache.set(source, { source: [...source], sorted })
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
