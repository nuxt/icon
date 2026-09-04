import { expect, it } from 'vitest'
import type { Nuxt } from '@nuxt/schema'
import type { IconifyJSON } from '@iconify/types'
import { NuxtIconModuleContext } from '../src/context'
import type { ModuleOptions, NuxtIconRuntimeOptions } from '../src/types'
import { collectionNames } from '../src/collection-names'

function createContext(options: Partial<ModuleOptions>) {
  const nuxt = {
    options: {
      rootDir: '/root',
      nitro: {},
      dev: false,
    },
  }
  return new NuxtIconModuleContext(nuxt as unknown as Nuxt, options as ModuleOptions)
}

// `module.ts` only reads `fallbackToApi` out of the runtime options here
const runtimeOptions = { fallbackToApi: true } as NuxtIconRuntimeOptions

const customCollection: IconifyJSON = {
  prefix: 'my-icons',
  icons: {
    logo: { body: '<path d="M0 0h24v24H0z"/>' },
  },
}

it('keeps custom collection prefixes out of the shared Iconify collection list', () => {
  const ctx = createContext({ customCollections: [customCollection] })
  expect(ctx.getRuntimeCollections(runtimeOptions)).toContain('my-icons')

  // Another app built in the same process must not inherit the first one's prefixes
  const other = createContext({})
  expect(other.getRuntimeCollections(runtimeOptions)).not.toContain('my-icons')
  expect(collectionNames).not.toContain('my-icons')
})

it('does not add a remote endpoint for a custom collection', async () => {
  const ctx = createContext({
    provider: 'server',
    serverBundle: 'remote',
    customCollections: [customCollection],
  })
  // `module.ts` fills `appConfig.icon.collections` from this before the server bundle resolves
  ctx.getRuntimeCollections(runtimeOptions)

  const { collections } = await ctx.resolveServerBundle()
  const entries = collections.filter(c => (typeof c === 'string' ? c : c.prefix) === 'my-icons')
  expect(entries).toEqual([customCollection])
})
