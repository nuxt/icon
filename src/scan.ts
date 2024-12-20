import fs from 'node:fs/promises'
import type { Nuxt } from 'nuxt/schema'
import { glob } from 'tinyglobby'
import pm from 'picomatch'
import type { ClientBundleScanOptions } from './types'
import { collectionNames } from './collection-names'

export class IconUsageScanner {
  globInclude: string[]
  globExclude: string[]
  matchRegex: RegExp

  constructor(scanOptions: ClientBundleScanOptions | true) {
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

    this.matchRegex = createMatchRegex(collections)
    this.globInclude = globInclude
    this.globExclude = globExclude
  }

  extractFromCode(
    code: string,
    set: Set<string>,
  ) {
    for (const match of code.matchAll(this.matchRegex)) {
      if (match) {
        set.add(`${match[1]}:${match[2]}`)
      }
    }
  }

  isFileMatch(path: string) {
    return pm.isMatch(path, this.globInclude) && !pm.isMatch(path, this.globExclude)
  }

  async scanFiles(
    nuxt: Nuxt,
    set: Set<string> = new Set(),
  ) {
    const files = await glob(
      this.globInclude,
      {
        ignore: this.globExclude,
        cwd: nuxt.options.rootDir,
        absolute: true,
        expandDirectories: false,
      },
    )

    await Promise.all(
      files.map(async (file) => {
        const code = await fs.readFile(file, 'utf-8').catch(() => '')
        this.extractFromCode(code, set)
      }),
    )

    return set
  }
}

export function createMatchRegex(
  collections: string[] | Set<string>,
) {
  const collectionsRegex = [...collections].sort((a, b) => b.length - a.length).join('|')
  return new RegExp('\\b(?:i-)?(' + collectionsRegex + ')[:-]([a-z0-9-]+)\\b', 'g')
}
