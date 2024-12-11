import fs from 'node:fs/promises'
import type { Nuxt } from 'nuxt/schema'
import { glob } from 'tinyglobby'
import type { ClientBundleScanOptions } from './types'
import { collectionNames } from './collection-names'

export function extraIconUsages(
  code: string,
  set: Set<string>,
  matchRegex: RegExp,
) {
  for (const match of code.matchAll(matchRegex)) {
    if (match) {
      set.add(`${match[1]}:${match[2]}`)
    }
  }
}

export function createMatchRegex(
  collections: string[] | Set<string>,
) {
  const collectionsRegex = [...collections].sort((a, b) => b.length - a.length).join('|')
  return new RegExp('\\b(?:i-)?(' + collectionsRegex + ')[:-]([a-z0-9-]+)\\b', 'g')
}

export async function scanSourceFiles(
  nuxt: Nuxt,
  scanOptions: ClientBundleScanOptions | true,
  set: Set<string> = new Set(),
) {
  const {
    globInclude = ['**/*.{vue,jsx,tsx,md,mdc,mdx,yml,yaml}'],
    globExclude = ['node_modules', 'dist', 'build', 'coverage', 'test', 'tests', '.*'],
    ignoreCollections = [],
    additionalCollections = [],
  } = scanOptions === true ? {} : scanOptions

  const collections = new Set([
    ...collectionNames,
    ...additionalCollections,
  ])
  for (const collection of ignoreCollections) {
    collections.delete(collection)
  }

  const matchRegex = createMatchRegex(collections)

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
      extraIconUsages(code, set, matchRegex)
    }),
  )

  return set
}
