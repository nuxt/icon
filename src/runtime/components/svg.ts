import { Icon as Iconify, addIcon, getIcon } from '@iconify/vue'
import { h, useId } from 'vue'
import type { VNode, PropType } from 'vue'
import type { NuxtIconRuntimeOptions } from '../../types'
import type { IconifyIconCustomizeCallback } from './shared'
import { initClientBundle, loadIcon, setupIconify, useResolvedName, resolveCustomizeFn } from './shared'
import { renderIconifySvg } from './svg-render'
import { useAsyncData, useNuxtApp, defineComponent, useAppConfig, onServerPrefetch } from '#imports'

export const NuxtIconSvg = /* @__PURE__ */ defineComponent({
  name: 'NuxtIconSvg',
  props: {
    name: {
      type: String as PropType<string>,
      required: true,
    },
    customize: {
      type: [Function, Boolean, null] as PropType<IconifyIconCustomizeCallback | boolean | null>,
      default: null,
      required: false,
    },
  },
  setup(props, { slots }) {
    setupIconify()
    const nuxt = useNuxtApp()
    const options = useAppConfig().icon as NuxtIconRuntimeOptions
    const name = useResolvedName(() => props.name)

    const storeKey = 'i-' + name.value

    if (name.value) {
      // On server side, we fetch the icon data and store it in the payload
      // Apply server prefetch function used for CSS icons.
      // @See https://github.com/nuxt/icon/issues/356
      onServerPrefetch(async () => {
        if (import.meta.server) {
          // an icon already in memory goes straight into the payload, under the key `useAsyncData`
          // would use: a `useAsyncData` per instance costs more than rendering the icon itself
          if (storeKey in nuxt.payload.data)
            return
          initClientBundle(addIcon)
          const icon = getIcon(name.value)
          if (icon) {
            nuxt.payload.data[storeKey] = icon
            return
          }
          await useAsyncData(
            storeKey,
            async () => await loadIcon(name.value, options.fetchTimeout),
            { deep: false },
          )
        }
      })

      // On client side, we feed Iconify we the data we have from server side to avoid hydration mismatch
      if (import.meta.client) {
        const payload = nuxt.payload.data[storeKey]
        if (payload) {
          addIcon(name.value, payload)
        }
        else {
          initClientBundle(addIcon)
        }
      }
    }

    // Iconify renames the ids inside an icon with a counter shared by every render on the
    // server, so an unchanged page would render different HTML on each request (#585).
    // `useId` is stable per position in the tree, on the server and the client.
    const idPrefix = useId().replace(/-/g, '_') + 'ID'

    return () => {
      const customize = resolveCustomizeFn(props.customize, options.customize)
      return h(Iconify, {
        icon: name.value,
        ssr: true,
        // Iconify uses `customise`, where we expose `customize` for consistency
        customise: (body: string, ...args: [string?, string?, string?]) =>
          replaceIDs(customize?.(body, ...args) ?? body, idPrefix),
      }, slots)
    }
  },
})

const idRE = /\sid="(\S+)"/g

/**
 * Renames the ids of an icon body to `prefix` + index, and updates their references.
 * The new ids are written with single quotes, so Iconify's own `replaceIDs`,
 * which only matches `id="…"`, leaves them alone.
 */
export function replaceIDs(body: string, prefix: string): string {
  const ids = new Set(Array.from(body.matchAll(idRE), m => m[1]!))
  let index = 0
  for (const id of ids) {
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // the same references Iconify updates: `url(#id)`, `href="#id"`, `begin="id.end"`, and the id itself.
    // `\0` marks renamed ids, so a later id cannot match a new one.
    body = body.replace(new RegExp(`([#;"])(${escaped})([")]|\\.[a-z])`, 'g'), `$1${prefix}${index++}\0$3`)
  }
  return body
    .replace(/\sid="([^"]*)\0"/g, ` id='$1'`)
    .replaceAll('\0', '')
}

/**
 * Sets up an icon to render straight to the `<svg>` that `<NuxtIconSvg>` and Iconify would produce,
 * without creating either component. The returned function takes the attributes `<NuxtIconSvg>`
 * would receive, and renders the icon when it is in memory and the attributes are supported.
 * It returns `null` otherwise, for the caller to fall back to `<NuxtIconSvg>`.
 */
export function useSvgIconRenderer(name: string): (attrs: Record<string, unknown>) => VNode | null {
  setupIconify()
  const nuxt = useNuxtApp()
  const storeKey = 'i-' + name
  const iconClass = iconifyClass(name)
  // Registered whether or not the icon renders directly, on the server and the client,
  // so `useId` sees the same async boundaries as with `<NuxtIconSvg>` during hydration.
  onServerPrefetch(() => {
    if (import.meta.server && !(storeKey in nuxt.payload.data)) {
      const icon = getIcon(name)
      if (icon)
        nuxt.payload.data[storeKey] = icon
    }
  })
  initClientBundle(addIcon)
  if (import.meta.client && nuxt.payload.data[storeKey] && !getIcon(name))
    addIcon(name, nuxt.payload.data[storeKey])

  return (attrs) => {
    const icon = getIcon(name)
    return icon ? renderIconifySvg(icon, iconClass, attrs) : null
  }
}

/** The classes Iconify adds to an icon: `iconify`, then its prefix and provider. */
function iconifyClass(name: string): string {
  const parts = name.split(':')
  const provider = parts.length > 2 && parts[0]!.startsWith('@') ? parts[0]!.slice(1) : ''
  const prefix = parts.length > 1 ? parts[parts.length - 2]!.replace(/^@/, '') : ''
  return 'iconify' + (prefix ? ' iconify--' + prefix : '') + (provider ? ' iconify--' + provider : '')
}
