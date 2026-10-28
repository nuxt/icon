import { computed, getCurrentInstance, useId } from 'vue'
import { fnv1a64Base36 } from 'fnv1a-64'
import type { IconifyIconCustomizeCallback } from './name'
import { useState } from '#imports'

const hydratedHashes = new Map<string, string>()

/**
 * Hash of a per-instance `customize` callback, used to suffix the icon class.
 *
 * Callback sources differ between the minified client and server builds, so
 * hydration reuses the SSR hash for every callback with the same client source.
 */
export function useCustomizeHash(getCustomize: () => IconifyIconCustomizeCallback | boolean | null | undefined) {
  const customize = getCustomize()
  if (typeof customize === 'function') {
    const id = useId()
    const ssrHashes = useState<Record<string, string>>('nuxt-icon-customize', () => ({}))
    const sourceHash = fnv1a64Base36(customize.toString())
    if (import.meta.server)
      ssrHashes.value[id] = sourceHash
    // `vnode.el` is already set during setup only when this instance is hydrating, including lazy hydration
    else if (getCurrentInstance()?.vnode.el && ssrHashes.value[id])
      hydratedHashes.set(sourceHash, ssrHashes.value[id])
  }

  return computed(() => {
    const customize = getCustomize()
    if (typeof customize !== 'function')
      return
    const sourceHash = fnv1a64Base36(customize.toString())
    return (import.meta.client && hydratedHashes.get(sourceHash)) || sourceHash
  })
}
