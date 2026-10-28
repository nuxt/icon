import { getIcon as _getIcon, addIcon as _addIcon, loadIcon as _loadIcon, addAPIProvider, _api, setCustomIconsLoader } from '@iconify/vue'
import type { IconifyIcon } from '@iconify/types'
import { init as initClientBundle } from '#build/nuxt-icon-client-bundle'
import { applyIconifyConfig } from '../iconify-config'

export { initClientBundle }
export { useResolvedName, resolveCustomizeFn } from './name'
export type { IconifyIconCustomizeCallback } from './name'

export function setupIconify() {
  applyIconifyConfig({ addAPIProvider, _api, setCustomIconsLoader })
}

export async function loadIcon(name: string, timeout: number): Promise<Required<IconifyIcon> | null | undefined> {
  if (!name)
    return null
  initClientBundle(_addIcon)
  setupIconify()
  const _icon = _getIcon(name)
  if (_icon)
    return _icon

  let timeoutWarn: ReturnType<typeof setTimeout>
  const load = _loadIcon(name)
    .catch(() => {
      console.warn(`[Icon] failed to load icon \`${name}\``)
      return null
    })

  if (timeout > 0)
    await Promise.race([
      load,
      new Promise<void>((resolve) => {
        timeoutWarn = setTimeout(() => {
          console.warn(`[Icon] loading icon \`${name}\` timed out after ${timeout}ms`)
          resolve()
        }, timeout)
      })])
      .finally(() => clearTimeout(timeoutWarn))
  else
    await load

  return _getIcon(name)
}
