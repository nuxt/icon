import { computed, reactive } from 'vue'
import { describe, expect, it } from 'vitest'
import { getSortedCollections, resolveName } from '../src/runtime/components/resolve-name'

function createOptions(collections: string[] | null, aliases: Record<string, string> = {}) {
  return { cssSelectorPrefix: 'i-', aliases, collections }
}

describe('resolveName', () => {
  it('keeps names that already contain a collection separator', () => {
    expect(resolveName('i-simple-icons:github', createOptions(['simple-icons']))).toBe('simple-icons:github')
  })

  it('resolves a bare name against the longest matching collection', () => {
    const options = createOptions(['simple', 'simple-icons', 'si'])
    expect(resolveName('i-simple-icons-github', options)).toBe('simple-icons:github')
    expect(resolveName('simple-icons-github', options)).toBe('simple-icons:github')
    expect(resolveName('i-simple-foo', options)).toBe('simple:foo')
    expect(resolveName('i-si-foo', options)).toBe('si:foo')
  })

  it('requires a hyphen after the collection name', () => {
    const options = createOptions(['simple', 'si'])
    expect(resolveName('i-simpleicons', options)).toBe('simpleicons')
    expect(resolveName('i-si', options)).toBe('si')
  })

  it('resolves aliases before matching collections', () => {
    expect(resolveName('i-github', createOptions(['simple-icons'], { github: 'simple-icons-github' }))).toBe('simple-icons:github')
  })

  it('keeps bare names without a matching collection', () => {
    expect(resolveName('i-unknown-icon', createOptions(['simple-icons']))).toBe('unknown-icon')
    expect(resolveName('i-unknown-icon', createOptions(null))).toBe('unknown-icon')
  })

  it('does not reorder the configured collections', () => {
    const collections = ['simple', 'simple-icons', 'si']
    resolveName('i-simple-icons-github', createOptions(collections))
    expect(collections).toEqual(['simple', 'simple-icons', 'si'])
  })

  it('updates computed names when reactive collections change in place', () => {
    const options = reactive(createOptions(['simple', 'foo']))
    const first = computed(() => resolveName('i-simple-icons-github', options))
    const second = computed(() => resolveName('i-simple-icons-github', options))
    expect(first.value).toBe('simple:icons-github')
    expect(second.value).toBe('simple:icons-github')

    options.collections![1] = 'simple-icons'
    expect(first.value).toBe('simple-icons:github')
    expect(second.value).toBe('simple-icons:github')
  })

  it('updates computed names when reactive collections grow', () => {
    const options = reactive(createOptions(['simple']))
    const name = computed(() => resolveName('i-simple-icons-github', options))
    expect(name.value).toBe('simple:icons-github')

    options.collections!.push('simple-icons')
    expect(name.value).toBe('simple-icons:github')
  })
})

describe('getSortedCollections', () => {
  it('sorts each collections array once', () => {
    const collections = ['simple', 'simple-icons']
    expect(getSortedCollections(collections)).toBe(getSortedCollections(collections))
  })
})
