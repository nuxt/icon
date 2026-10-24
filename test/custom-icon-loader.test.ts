import { describe, expect, it, vi } from 'vitest'
import type { IconifyJSON } from '@iconify/types'
import {
  ICONS_QUERY_BUDGET,
  chunkIconsByQueryBudget,
  loadCustomIconsChunked,
  mergeIconifyJSONChunks,
} from '../src/runtime/custom-icon-loader'

describe('chunkIconsByQueryBudget', () => {
  it('returns empty for an empty list', () => {
    expect(chunkIconsByQueryBudget([])).toEqual([])
  })

  it('keeps a short list in one chunk', () => {
    expect(chunkIconsByQueryBudget(['a', 'b', 'c'], 100)).toEqual([['a', 'b', 'c']])
  })

  it('splits when the joined query would exceed the budget', () => {
    // "aaaa,bbbb" is 9 chars; budget 8 → each name alone
    expect(chunkIconsByQueryBudget(['aaaa', 'bbbb', 'cccc'], 8)).toEqual([
      ['aaaa'],
      ['bbbb'],
      ['cccc'],
    ])
  })

  it('packs as many names as fit under the budget', () => {
    // "aa,bb" = 5; adding ",cc" would be 8 > 6 → second chunk
    expect(chunkIconsByQueryBudget(['aa', 'bb', 'cc'], 6)).toEqual([
      ['aa', 'bb'],
      ['cc'],
    ])
  })

  it('puts an oversized single name in its own chunk', () => {
    expect(chunkIconsByQueryBudget(['abcdefghij'], 5)).toEqual([['abcdefghij']])
  })

  it('keeps the default budget join under the limit', () => {
    const names = Array.from({ length: 1500 }, (_, i) => `icon-${String(i).padStart(4, '0')}`)
    const chunks = chunkIconsByQueryBudget(names)
    expect(chunks.length).toBeGreaterThan(1)
    for (const chunk of chunks)
      expect(chunk.join(',').length).toBeLessThanOrEqual(ICONS_QUERY_BUDGET)
    expect(chunks.flat()).toEqual(names)
  })
})

describe('mergeIconifyJSONChunks', () => {
  it('merges icons and aliases and keeps the first prefix', () => {
    const a: IconifyJSON = {
      prefix: 'fa',
      icons: { home: { body: '<path/>' } },
      aliases: { house: { parent: 'home' } },
    }
    const b: IconifyJSON = {
      prefix: 'fa',
      icons: { user: { body: '<circle/>' } },
      aliases: { person: { parent: 'user' } },
    }
    expect(mergeIconifyJSONChunks([a, b], 'fa')).toEqual({
      prefix: 'fa',
      icons: { home: { body: '<path/>' }, user: { body: '<circle/>' } },
      aliases: { house: { parent: 'home' }, person: { parent: 'user' } },
    })
  })
})

describe('loadCustomIconsChunked', () => {
  it('fetches each chunk and merges icons and aliases', async () => {
    const names = Array.from({ length: 20 }, (_, i) => `n${i}`)
    const fetchChunk = vi.fn(async (chunk: string[]) => ({
      prefix: 'c',
      icons: Object.fromEntries(chunk.map(n => [n, { body: `<${n}/>` }])),
      aliases: Object.fromEntries(chunk.map(n => [`a-${n}`, { parent: n }])),
    } satisfies IconifyJSON))

    const result = await loadCustomIconsChunked(names, 'c', fetchChunk, 30)

    expect(fetchChunk.mock.calls.length).toBeGreaterThan(1)
    for (const [chunk] of fetchChunk.mock.calls)
      expect((chunk as string[]).join(',').length).toBeLessThanOrEqual(30)
    expect(Object.keys(result.icons).sort()).toEqual([...names].sort())
    expect(Object.keys(result.aliases || {}).sort()).toEqual(names.map(n => `a-${n}`).sort())
    expect(result.prefix).toBe('c')
  })

  it('throws when any chunk returns invalid data (caller maps to null)', async () => {
    await expect(loadCustomIconsChunked(
      ['a', 'b', 'c'],
      'c',
      async (chunk) => {
        if (chunk.includes('b'))
          return { prefix: 'wrong', icons: { b: { body: '' } } }
        return { prefix: 'c', icons: Object.fromEntries(chunk.map(n => [n, { body: '' }])) }
      },
      3,
    )).rejects.toThrow(/Invalid data/)
  })
})
