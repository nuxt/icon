import type { Nuxt } from '@nuxt/schema'

export function getResolvePaths(nuxt: Nuxt): string[] {
  return Array.from(new Set(
    [nuxt.options.rootDir, nuxt.options.workspaceDir].filter(Boolean),
  ))
}
