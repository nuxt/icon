import { getLayerDirectories } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'

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
