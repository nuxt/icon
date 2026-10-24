import { computed, reactive, toRaw } from 'vue'
import type { NuxtIconRuntimeOptions } from '../../types'

const HYPHEN = 45

const sortedCollectionsCache = new WeakMap<string[], { readonly value: string[] }>()

export function getSortedCollections(collections: string[] | null | undefined): string[] {
  if (!collections)
    return []
  const key = toRaw(collections)
  let sorted = sortedCollectionsCache.get(key)
  if (!sorted) {
    const sort = (source: string[]) => [...source].sort((a, b) => b.length - a.length)
    // App config is cloned per request on the server, but reactive and updated in place on the client (HMR, `updateAppConfig`)
    sorted = import.meta.client ? computed(() => sort(reactive(key))) : { value: sort(key) }
    sortedCollectionsCache.set(key, sorted)
  }
  return sorted.value
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
