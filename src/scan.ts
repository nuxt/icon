import fs from 'node:fs/promises'
import type { Nuxt } from 'nuxt/schema'
import { glob } from 'tinyglobby'
import { iconMatchRegex } from './icon-regex'
import type { ClientBundleScanOptions } from './types'

export function extraIconUsages(code: string, set: Set<string>, ignoreCollections: string[]) {
  for (const match of code.matchAll(iconMatchRegex)) {
    if (match && !ignoreCollections.includes(match[1])) {
      set.add(`${match[1]}:${match[2]}`)
    }
  }
}

export async function scanSourceFiles(nuxt: Nuxt, scanOptions: ClientBundleScanOptions | true, set: Set<string> = new Set()) {
  const {
    globInclude = ['**/*.{vue,jsx,tsx,md,mdc,mdx}'],
    globExclude = ['node_modules', 'dist', 'build', 'coverage', 'test', 'tests', '.*'],
    ignoreCollections = [],
  } = scanOptions === true ? {} : scanOptions

  const files = await glob(
    globInclude,
    {
      ignore: globExclude,
      cwd: nuxt.options.rootDir,
      absolute: true,
      expandDirectories: false,
    },
  )

  await Promise.all(
    files.map(async (file) => {
      const code = await fs.readFile(file, 'utf-8').catch(() => '')
      extraIconUsages(code, set, ignoreCollections)
    }),
  )

  return set
}
