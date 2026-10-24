import type { IconifyJSON } from '@iconify/types'

/**
 * Max length of the `icons=` query value. Keeps GET URLs under common
 * reverse-proxy / server limits that surface as 431 / 414 when a custom
 * collection asks for hundreds or thousands of names in one request.
 * Midpoint of a safe ~2–4k character budget for the joined name list.
 */
export const ICONS_QUERY_BUDGET = 3072

/**
 * Split icon names so that `names.join(',')` stays within `maxBytes`.
 * A single name longer than the budget still forms its own chunk.
 */
export function chunkIconsByQueryBudget(icons: string[], maxBytes = ICONS_QUERY_BUDGET): string[][] {
  if (!icons.length)
    return []

  const chunks: string[][] = []
  let current: string[] = []
  let currentLen = 0

  for (const name of icons) {
    const added = current.length === 0 ? name.length : name.length + 1
    if (current.length > 0 && currentLen + added > maxBytes) {
      chunks.push(current)
      current = [name]
      currentLen = name.length
    }
    else {
      current.push(name)
      currentLen += added
    }
  }

  if (current.length)
    chunks.push(current)

  return chunks
}

/**
 * Merge chunk responses: `prefix` from the first item, `icons` and `aliases` unioned.
 */
export function mergeIconifyJSONChunks(chunks: IconifyJSON[], prefix: string): IconifyJSON {
  return chunks.reduce<IconifyJSON>((acc, item) => ({
    prefix: acc.prefix || item.prefix,
    icons: { ...acc.icons, ...item.icons },
    aliases: { ...acc.aliases, ...item.aliases },
  }), { prefix, icons: {}, aliases: {} })
}

/**
 * Fetch custom icons in query-budget chunks and merge. Throws on invalid data
 * so the caller can map any failure to `null` (same as the previous single-request path).
 */
export async function loadCustomIconsChunked(
  icons: string[],
  prefix: string,
  fetchChunk: (names: string[]) => Promise<IconifyJSON>,
  maxBytes = ICONS_QUERY_BUDGET,
): Promise<IconifyJSON> {
  const nameChunks = chunkIconsByQueryBudget(icons, maxBytes)
  const results = await Promise.all(nameChunks.map(chunk => fetchChunk(chunk)))

  for (const data of results) {
    if (!data || data.prefix !== prefix || !data.icons)
      throw new Error('Invalid data' + JSON.stringify(data))
  }

  return mergeIconifyJSONChunks(results, prefix)
}
