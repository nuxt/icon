import { computed, reactive, toRaw } from 'vue'
import type { NuxtIconRuntimeOptions } from '../../types'

const collectionSetCache = new WeakMap<string[], { readonly value: Set<string> }>()

export function getCollectionSet(collections: string[] | null | undefined): Set<string> | undefined {
  if (!collections)
    return
  const key = toRaw(collections)
  let set = collectionSetCache.get(key)
  if (!set) {
    // App config is cloned per request on the server, but reactive and updated in place on the client (HMR, `updateAppConfig`)
    set = import.meta.client ? computed(() => new Set(reactive(key))) : { value: new Set(key) }
    collectionSetCache.set(key, set)
  }
  return set.value
}

function findCollection(name: string, collections: Set<string>): string | undefined {
  let index = name.lastIndexOf('-')
  while (index > 0) {
    const collection = name.slice(0, index)
    if (collections.has(collection))
      return collection
    index = name.lastIndexOf('-', index - 1)
  }
}

export function resolveName(name: string, options: Pick<NuxtIconRuntimeOptions, 'cssSelectorPrefix' | 'aliases' | 'collections'>): string {
  const bare = name.startsWith(options.cssSelectorPrefix)
    ? name.slice(options.cssSelectorPrefix.length)
    : name
  const resolved = options.aliases?.[bare] || bare

  // Disambiguate collection
  // e.g. `simple-icons-github` -> `simple-icons:github`
  if (!resolved.includes(':')) {
    const collections = getCollectionSet(options.collections)
    const collection = collections && findCollection(resolved, collections)
    return collection
      ? collection + ':' + resolved.slice(collection.length + 1)
      : resolved
  }
  return resolved
}
