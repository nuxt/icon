import { basename, join, isAbsolute } from 'node:path'
import fs from 'node:fs/promises'
import { logger } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import fg from 'fast-glob'
import type { IconifyJSON } from '@iconify/types'
import { parseSVGContent, convertParsedSVG } from '@iconify/utils/lib/svg/parse'
import { isPackageExists } from 'local-pkg'
import collectionNames from './collection-names'
import type { CustomCollection, ServerBundleOptions, RemoteCollection } from './types'

export const isFullCollectionExists = isPackageExists('@iconify/json')

export async function resolveCollection(
  nuxt: Nuxt,
  collection: string | IconifyJSON | CustomCollection | RemoteCollection,
): Promise<string | IconifyJSON | RemoteCollection> {
  if (typeof collection === 'string')
    return collection
  // Custom collection
  if ('dir' in collection) {
    return await loadCustomCollection(collection, nuxt)
  }
  return collection
}

export function getCollectionPath(collection: string) {
  return isFullCollectionExists
    ? `@iconify/json/json/${collection}.json`
    : `@iconify-json/${collection}/icons.json`
}

export async function loadCustomCollection(collection: CustomCollection, nuxt: Nuxt): Promise<IconifyJSON> {
  const dir = isAbsolute(collection.dir)
    ? collection.dir
    : join(nuxt.options.rootDir, collection.dir)
  const files = (await fg('*.svg', { cwd: dir, onlyFiles: true }))
    .sort()

  const parsedIcons = await Promise.all(files.map(async (file) => {
    const name = basename(file, '.svg')
    let svg = await fs.readFile(join(dir, file), 'utf-8')
    const cleanupIdx = svg.indexOf('<svg')
    if (cleanupIdx > 0)
      svg = svg.slice(cleanupIdx)
    const data = convertParsedSVG(parseSVGContent(svg)!)
    if (!data) {
      logger.error(`Nuxt Icon could not parse the SVG content for icon \`${name}\``)
      return [name, {}]
    }
    if (data.top === 0)
      delete data.top
    if (data.left === 0)
      delete data.left
    return [name, data]
  }))

  const successfulIcons = parsedIcons.filter(([_, data]) => Object.keys(data).length > 0)

  logger.success(`Nuxt Icon loaded local collection \`${collection.prefix}\` with ${successfulIcons.length} icons`)
  const result: IconifyJSON = {
    ...collection,
    icons: Object.fromEntries(successfulIcons),
  }
  // @ts-expect-error remove extra properties
  delete result.dir
  return result
}

export async function discoverInstalledCollections(): Promise<ServerBundleOptions['collections']> {
  const collections = isFullCollectionExists
    ? collectionNames
    : collectionNames.filter(collection => isPackageExists('@iconify-json/' + collection))
  if (isFullCollectionExists)
    logger.success(`Nuxt Icon discovered local-installed ${collections.length} collections (@iconify/json)`)
  else if (collections.length)
    logger.success(`Nuxt Icon discovered local-installed ${collections.length} collections:`, collections.join(', '))
  return collections
}
