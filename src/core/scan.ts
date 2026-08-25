import fs from 'node:fs/promises'
import { glob } from 'tinyglobby'
import pm from 'picomatch'
import type { ClientBundleScanOptions } from './types'
import { collectionNames } from '../collection-names'

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
    cwd: string | string[],
    set: Set<string> = new Set(),
  ) {
    const dirs = Array.isArray(cwd) ? cwd : [cwd]
    const files = new Set(
      (await Promise.all(
        dirs.map(dir => glob(
          this.globInclude,
          {
            ignore: this.globExclude,
            cwd: dir,
            absolute: true,
            expandDirectories: false,
          },
        )),
      )).flat(),
    )

    await Promise.all(
      [...files].map(async (file) => {
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
  // `(?<![\w-])` / `(?![\w-])`: a reference never starts or ends in the middle of a
  // longer identifier, so `source-map-js` is not `map:js` and `--gg-size` is not
  // `gg:size`. `\b` alone let both through, because a `-` is a word boundary.
  //
  // The name follows Iconify's own icon name grammar, which has no leading,
  // doubled or trailing `-`, so a name that cannot exist is never extracted:
  // https://github.com/iconify/iconify/blob/2274c033b49c01a50dc89b490b89d803d19d95dc/packages/utils/src/icon/name.ts#L15-L18
  return new RegExp('(?<![\\w-])(?:i-)?(' + collectionsRegex + ')[:-]([a-z0-9]+(?:-[a-z0-9]+)*)(?![\\w-])', 'g')
}
