// @ts-ignore
import iconCollections from '#icon-collections'

export function resolveIconName (name: string = '') {
  let prefix
  let provider = ''

  if (name[0] === '@' && name.includes(':')) {
    provider = name.split(':')[0].slice(1)
    name = name.split(':').slice(1).join(':')
  }

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
    provider,
    prefix: prefix || '',
    name: name || ''
  }
}
