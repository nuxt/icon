import { Icon as Iconify, addIcon, buildIcon, getIcon, replaceIDs } from '@iconify/vue'
import { h } from 'vue'
import type { VNode, PropType } from 'vue'
import type { NuxtIconRuntimeOptions } from '../../types'
import type { IconifyIconCustomizeCallback } from './shared'
import { initClientBundle, loadIcon, setupIconify, useResolvedName, resolveCustomizeFn } from './shared'
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

    return () => h(Iconify, {
      icon: name.value,
      ssr: true,
      // Iconify uses `customise`, where we expose `customize` for consistency
      customise: resolveCustomizeFn(props.customize, options.customize),
    }, slots)
  },
})

/**
 * Sets up an icon to render straight to the `<svg>` that `<NuxtIconSvg>` and Iconify would produce,
 * without creating either component. The returned function renders the icon when it is in memory,
 * and returns `null` otherwise, for the caller to fall back to `<NuxtIconSvg>`.
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
    if (!icon)
      return null
    const { attributes, body } = buildIcon(icon, {})
    return h('svg', {
      'xmlns': 'http://www.w3.org/2000/svg',
      'xmlns:xlink': 'http://www.w3.org/1999/xlink',
      'aria-hidden': true,
      'role': 'img',
      ...attrs,
      'class': [iconClass, attrs.class],
      'style': attrs.style || {},
      ...attributes,
      'innerHTML': replaceIDs(body),
    })
  }
}

/** The classes Iconify adds to an icon: `iconify`, then its prefix and provider. */
function iconifyClass(name: string): string {
  const parts = name.split(':')
  const provider = parts.length > 2 && parts[0]!.startsWith('@') ? parts[0]!.slice(1) : ''
  const prefix = parts.length > 1 ? parts[parts.length - 2]!.replace(/^@/, '') : ''
  return 'iconify' + (prefix ? ' iconify--' + prefix : '') + (provider ? ' iconify--' + provider : '')
}
