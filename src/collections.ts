import type { Nuxt } from '@nuxt/schema'

export function getResolvePaths(nuxt: Nuxt): string[] {
  const layerDirs = (nuxt.options._layers || []).map(
    layer => layer.cwd || layer.config?.rootDir,
  )

  return Array.from(
    new Set(
      [nuxt.options.rootDir, nuxt.options.workspaceDir, ...layerDirs].filter(
        Boolean,
      ),
    ),
  )
}
