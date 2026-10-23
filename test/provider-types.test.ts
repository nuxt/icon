import { expectTypeOf, it } from 'vitest'
import type { IconProviderOption } from '../src/runtime/provider'
import type { NuxtIconRuntimeOptions } from '../src/schema-types'

// `src/runtime/provider.ts` declares its own types so its shipped `.d.ts` stays self-contained.
// Checked by `pnpm typecheck`: keeps them in sync with the schema.
it('matches the `provider` type from the schema', () => {
  expectTypeOf<IconProviderOption>().toEqualTypeOf<NuxtIconRuntimeOptions['provider']>()
})
