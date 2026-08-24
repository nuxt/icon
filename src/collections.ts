import { getLayerDirectories } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { IconifyJSON } from '@iconify/types'
import type { CustomCollection, ModuleOptions, RemoteCollection } from './types'

export function getResolvePaths(nuxt: Nuxt): string[] {
  const layerDirs = getLayerDirectories(nuxt).map(
    dir => dir.root,
  )

  return Array.from(
    new Set(
      [nuxt.options.rootDir, nuxt.options.workspaceDir, ...layerDirs].filter(
        Boolean,
      ),
    ),
  )
}

type ConfiguredCollection = string | IconifyJSON | CustomCollection | RemoteCollection

/**
 * Builds the lookup that tells a custom collection which directory its relative
 * `dir` is relative to.
 *
 * A collection declared in a Nuxt layer means "this directory inside my layer",
 * so `dir` has to be resolved against that layer's `cwd` rather than the app's
 * `rootDir`, which is somewhere else entirely.
 *
 * Nuxt clones layer configs while merging them into `nuxt.options`, so the
 * declaring layer cannot be found by object identity. Entries are matched on
 * `prefix` + `dir` instead, and each match is consumed so two layers declaring
 * the same collection still resolve against their own directory. Anything with
 * no match (a collection pushed by another module, for instance) keeps
 * resolving from `rootDir`, as before.
 *
 * The returned function consumes its matches, so build a new one per pass.
 */
export function createCollectionDirResolver(nuxt: Nuxt): (collection: ConfiguredCollection) => string {
  const declared: { prefix: string, dir: string, cwd: string }[] = []

  for (const layer of nuxt.options._layers) {
    const icon = (layer.config as { icon?: ModuleOptions }).icon
    const serverBundle = icon?.serverBundle
    const collections: ConfiguredCollection[] = [
      ...icon?.customCollections || [],
      ...(typeof serverBundle === 'object' && serverBundle?.collections) || [],
    ]
    for (const collection of collections) {
      if (typeof collection !== 'string' && 'dir' in collection)
        declared.push({ prefix: collection.prefix, dir: collection.dir, cwd: layer.cwd })
    }
  }

  return (collection) => {
    if (typeof collection === 'string' || !('dir' in collection))
      return nuxt.options.rootDir

    const index = declared.findIndex(entry => entry.prefix === collection.prefix && entry.dir === collection.dir)
    if (index === -1)
      return nuxt.options.rootDir

    return declared.splice(index, 1)[0]!.cwd
  }
}
