import { Icon as Iconify, addIcon } from '@iconify/vue'
import { h } from 'vue'
import type { PropType } from 'vue'
import type { NuxtIconRuntimeOptions, IconifyIconCustomizeCallback } from '../../types'
import { initClientBundle, loadIcon, useResolvedName, useResolveCustomization } from './shared'
import { useAsyncData, useNuxtApp, defineComponent, useAppConfig } from '#imports'

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
    const nuxt = useNuxtApp()
    const options = useAppConfig().icon as NuxtIconRuntimeOptions
    const name = useResolvedName(() => props.name)

    const storeKey = 'i-' + name.value

    if (name.value) {
      // On server side, we fetch the icon data and store it in the payload
      if (import.meta.server) {
        useAsyncData(
          storeKey,
          () => loadIcon(name.value, options.fetchTimeout),
          { deep: false },
        )
      }

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
      customise: useResolveCustomization(props.customize, options.customize),
    }, slots)
  },
})
