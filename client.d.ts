declare module 'virtual:nuxt-icon-bundle' {
  import type { IconifyIcon } from '@iconify/types'

  /**
   * Register every bundled icon through the passed `addIcon`
   * (e.g. `addIcon` from `@iconify/vue`).
   */
  export function init(addIcon: (name: string, data: IconifyIcon) => void): void
}

declare module 'virtual:nuxt-icon-bundle/register' {
  // Side-effect only: registers the bundled icons on `@iconify/vue`
}
