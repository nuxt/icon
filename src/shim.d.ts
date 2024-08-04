declare module '#nuxt-icon-server-bundle' {
  import type { IconifyCollection } from '@iconify/types'

  export const collections: Record<string, () => Promise<IconifyCollection>>
}

declare module '#build/nuxt-icon-client-bundle' {
  export function init(): void
}

declare module '#imports-customize' {
  import type { IconifyIconCustomizeCallback } from './types'

  const customize: IconifyIconCustomizeCallback
  export default customize
}
