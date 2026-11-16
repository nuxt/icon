import { Icon as Iconify, addIcon, getIcon } from '@iconify/vue'
import { h } from 'vue'
import type { PropType } from 'vue'
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

    return () => h(Iconify, {
      icon: name.value,
      ssr: true,
      // Iconify uses `customise`, where we expose `customize` for consistency
      customise: resolveCustomizeFn(props.customize, options.customize),
    }, slots)
  },
})
