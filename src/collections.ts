import { join, isAbsolute, normalize, parse } from 'node:path'
import fs from 'node:fs/promises'
import { logger } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { glob } from 'tinyglobby'
import type { IconifyIcon, IconifyJSON } from '@iconify/types'
import { parseSVGContent, convertParsedSVG } from '@iconify/utils/lib/svg/parse'
import { isPackageExists } from 'local-pkg'
import { collectionNames } from './collection-names'
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

// https://github.com/iconify/iconify/blob/2274c033b49c01a50dc89b490b89d803d19d95dc/packages/utils/src/icon/name.ts#L15-L18
const validIconNameRE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export async function loadCustomCollection(
  collection: IconifyJSON | CustomCollection,
  nuxt: Nuxt,
): Promise<IconifyJSON> {
  if ('dir' in collection) {
    return parseCustomCollection(collection, nuxt)
  }

  logger.success(`Nuxt Icon loaded local collection \`${collection.prefix}\` with ${Object.keys(collection.icons).length} icons`)
  return collection
}

type ParsedIcon = [string, IconifyIcon]

async function parseCustomCollection(
  collection: CustomCollection,
  nuxt: Nuxt,
): Promise<IconifyJSON> {
  const dir = isAbsolute(collection.dir)
    ? collection.dir
    : join(nuxt.options.rootDir, collection.dir)

  const {
    // TODO: next major flip this
    normalizeIconName = true,
    recursive = false,
  } = collection

  const pattern = recursive ? '**/*.svg' : '*.svg'

  const files = (await glob([pattern], {
    cwd: dir,
    onlyFiles: true,
    expandDirectories: recursive,
  }))
    .sort()

  const parsedIcons: (ParsedIcon | null)[] = await Promise.all(files.map(async (file) => {
    const { dir: path, name: filename } = parse(file)
    const pathNormalized = path ? normalize(path).replace(/[/\\]/g, '-') : ''
    let name = pathNormalized ? `${pathNormalized}-${filename}` : filename

    // Currently Iconify only supports kebab-case icon names
    // https://github.com/nuxt/icon/issues/265#issuecomment-2441604639
    // We normalize the icon name to kebab-case and warn user about it
    if (normalizeIconName && !validIconNameRE.test(name)) {
      const normalized = name
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
      if (normalized !== name)
        logger.warn(`Custom icon \`${name}\` is normalized to \`${normalized}\`, we recommend to change the file name to match the icon name, or pass \`normalizeIconName: false\` to your custom collection options`)
      name = normalized
    }

    let svg = await fs.readFile(join(dir, file), 'utf-8')
    const cleanupIdx = svg.indexOf('<svg')
    if (cleanupIdx > 0)
      svg = svg.slice(cleanupIdx)
    const data = convertParsedSVG(parseSVGContent(svg)!)
    if (!data) {
      logger.error(`Nuxt Icon could not parse the SVG content for icon \`${name}\``)
      return null
    }
    if (data.top === 0)
      delete data.top
    if (data.left === 0)
      delete data.left
    return [name, data]
  }))

  const successfulIcons: ParsedIcon[] = parsedIcons.filter((entry): entry is ParsedIcon => entry !== null)

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

  if (isFullCollectionExists)
    logger.warn('Currently all iconify collections are included in the bundle, which might be inefficient, consider explicit name the collections you use in the `icon.serverBundle.collections` option')

  return collections
}
