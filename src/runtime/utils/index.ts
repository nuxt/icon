// @ts-ignore
import iconCollections from '#icon-collections'

export function resolveIconName (name: string) {
  let prefix

  if (name.startsWith('i-')) {
    name = name.replace(/^i-/, '')
    for (const collectionName of iconCollections) {
      if (name.startsWith(collectionName)) {
        prefix = collectionName
        name = name.slice(collectionName.length + 1) // remove collection name with extra -

        break
      }
    }
  } else if (name.includes(':')) {
    const [_prefix, _name] = name.split(':')

    prefix = _prefix
    name = _name
  }

  return {
    prefix: prefix || '',
    name: name || ''
  }
}
