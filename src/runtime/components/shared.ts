import { computed } from 'vue'
import { loadIcons, getIcon as _getIcon } from '@iconify/vue'
import type { IconifyIcon } from '@iconify/types'
import type { NuxtIconRuntimeOptions } from '../../types'
import { useAppConfig } from '#imports'
import { init } from '#build/nuxt-icon-client-bundle'

export async function loadIcon(name: string): Promise<Required<IconifyIcon> | null> {
  if (!name)
    return null
  init()
  await new Promise(resolve => loadIcons([name], () => resolve(true)))
    .catch(() => null)
  return _getIcon(name)
}

export function useResolvedName(getName: () => string) {
  const options = useAppConfig().icon as NuxtIconRuntimeOptions
  const collections = (options.collections || []).sort((a, b) => b.length - a.length)

  return computed(() => {
    const name = getName()
    const bare = name.startsWith(options.cssSelectorPrefix)
      ? name.slice(options.cssSelectorPrefix.length)
      : name
    const resolved = options.aliases?.[bare] || bare

    // Disambiguate collection
    // e.g. `simple-icons-github` -> `simple-icons:github`
    if (!resolved.includes(':')) {
      const collection = collections.find(c => resolved.startsWith(c + '-'))
      return collection
        ? collection + ':' + resolved.slice(collection.length + 1)
        : resolved
    }
    return resolved
  })
}
