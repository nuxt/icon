declare module '#nuxt-icon-server-bundle' {
  import type { IconifyCollection } from '@iconify/types'

  export const collections: Record<string, () => Promise<IconifyCollection>>
}

declare module '#build/nuxt-icon-client-bundle' {
  export function init(): void
}
