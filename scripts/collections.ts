import fs from 'node:fs/promises'
import collections from '@iconify/collections/collections.json' with { type: 'json' }

const names = Object.keys(collections).sort()
const regexPrefix = [...names].sort((a, b) => b.length - a.length).join('|')

await fs.writeFile(
  './src/collection-names.ts',
  [
    '// GENERATED BY scripts/collections.ts',
    `export const collectionNames = ${JSON.stringify(names, null, 2)}`,
  ].join('\n'),
  'utf-8',
)

await fs.writeFile(
  './src/icon-regex.ts',
  [
    '// GENERATED BY scripts/collections.ts',
    `export const iconMatchRegex = /\\b(?:i-)?(${regexPrefix})[:-]([a-z0-9-]+)\\b/g`,
  ].join('\n'),
  'utf-8',
)
