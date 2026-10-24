import { getIconCSS } from '@iconify/utils/lib/css/icon'
import type { IconifyIcon } from '@iconify/types'

const MAX_SIZE = 1000
const cache = new Map<string, { icon: IconifyIcon, css: string }>()

function isSameIcon(a: IconifyIcon, b: IconifyIcon) {
  const keys = Object.keys(a) as (keyof IconifyIcon)[]
  return keys.length === Object.keys(b).length && keys.every(key => Object.hasOwn(b, key) && a[key] === b[key])
}

export function getCachedIconCSS(icon: IconifyIcon, iconSelector: string, customise?: (content: string) => string) {
  if (customise)
    return getIconCSS(icon, { iconSelector, format: 'compressed', customise })
  const cached = cache.get(iconSelector)
  if (cached && isSameIcon(cached.icon, icon))
    return cached.css
  const css = getIconCSS(icon, { iconSelector, format: 'compressed' })
  if (!cached && cache.size >= MAX_SIZE)
    cache.clear()
  cache.set(iconSelector, { icon: { ...icon }, css })
  return css
}
