declare module '#nuxt-icon-server-bundle' {
  import type { IconifyCollection } from '@iconify/types'

  export const collections: Record<string, () => Promise<IconifyCollection>>
}

declare module '#build/nuxt-icon-client-bundle' {
  import type { IconifyIcon } from '@iconify/types'

  export function init(addIcon: ((name: string, data: IconifyIcon) => void)): void
}

declare module '#nuxt-icon-server-options' {
  const options: {
    iconifyApiEndpoint: string
    fallbackToApi: boolean | 'server-only' | 'client-only'
  }
  export default options
}

declare module '#nuxt-icon-server-runtime' {
  import type { defineCachedEventHandler } from 'nitropack/runtime'

  export const defineCachedHandler: typeof defineCachedEventHandler
}
