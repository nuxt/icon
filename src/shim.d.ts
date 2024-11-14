declare module '#nuxt-icon-server-bundle' {
  import type { IconifyCollection } from '@iconify/types'

  export const collections: Record<string, () => Promise<IconifyCollection>>
}

declare module '#build/nuxt-icon-client-bundle' {
  import type { IconifyIcon } from '@iconify/types'

  export function init(addIcon: ((name: string, data: IconifyIcon) => void)): void
}
