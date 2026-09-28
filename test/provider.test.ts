import { describe, expect, it } from 'vitest'
import { getSideProvider, normalizeProvider, usesLocalApi, type IconProvider, type IconProviderOption } from '../src/runtime/provider'
import type { ModuleOptions } from '../src/types'

describe('normalizeProvider', () => {
  it('uses the fallback when not set', () => {
    expect(normalizeProvider(undefined, 'server')).toBe('server')
    expect(normalizeProvider(undefined, 'iconify')).toBe('iconify')
  })

  it('keeps a string as-is', () => {
    expect(normalizeProvider('none', 'server')).toBe('none')
    expect(normalizeProvider('server', 'iconify')).toBe('server')
  })

  it('keeps a full object', () => {
    expect(normalizeProvider({ server: 'server', client: 'iconify' }, 'iconify')).toEqual({ server: 'server', client: 'iconify' })
    expect(normalizeProvider({ server: 'none', client: 'server' }, 'server')).toEqual({ server: 'none', client: 'server' })
  })

  it('requires both sides in the object form', () => {
    // @ts-expect-error `client` is required
    expect(() => normalizeProvider({ server: 'server' }, 'server')).toThrow('`icon.provider` object must define both `server` and `client`')
    // @ts-expect-error `server` is required
    expect(() => normalizeProvider({ client: 'iconify' }, 'server')).toThrow('`icon.provider` object must define both `server` and `client`')
    // @ts-expect-error both sides are required
    expect(() => normalizeProvider({}, 'server')).toThrow('`icon.provider` object must define both `server` and `client`')
  })

  it('requires both sides in the module options type', () => {
    const full: ModuleOptions = { provider: { server: 'server', client: 'iconify' } }
    // @ts-expect-error `server` is required
    const partial: ModuleOptions = { provider: { client: 'iconify' } }
    expect([full, partial]).toHaveLength(2)
  })
})

describe('getSideProvider', () => {
  it('returns a string for both sides', () => {
    expect(getSideProvider('server', 'server')).toBe('server')
    expect(getSideProvider('server', 'client')).toBe('server')
  })

  it('returns the side of an object', () => {
    expect(getSideProvider({ server: 'server', client: 'iconify' }, 'server')).toBe('server')
    expect(getSideProvider({ server: 'server', client: 'iconify' }, 'client')).toBe('iconify')
  })

  it('returns undefined for a missing side (e.g. a partial object in app.config)', () => {
    expect(getSideProvider({ server: 'server' } as unknown as IconProviderOption, 'client')).toBeUndefined()
  })

  it('returns undefined when not set', () => {
    expect(getSideProvider(undefined, 'server')).toBeUndefined()
    expect(getSideProvider(null as never, 'client')).toBeUndefined()
  })
})

describe('usesLocalApi', () => {
  const providers: IconProvider[] = ['server', 'iconify', 'none']
  for (const server of providers) {
    for (const client of providers) {
      const expected = server === 'server' || client === 'server'
      it(`{ server: '${server}', client: '${client}' } -> ${expected}`, () => {
        expect(usesLocalApi({ server, client })).toBe(expected)
      })
    }
  }

  it('handles the string form', () => {
    expect(usesLocalApi('server')).toBe(true)
    expect(usesLocalApi('iconify')).toBe(false)
    expect(usesLocalApi('none')).toBe(false)
    expect(usesLocalApi(undefined)).toBe(false)
  })
})
