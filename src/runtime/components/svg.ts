import { Icon as Iconify, addIcon } from '@iconify/vue'
import { h } from 'vue'
import type { NuxtIconRuntimeOptions } from '../../types'
import { loadIcon, useResolvedName } from './shared'
import { useAsyncData, useNuxtApp, defineComponent, useAppConfig } from '#imports'

export const NuxtIconSvg = /* @__PURE__ */ defineComponent({
  name: 'NuxtIconSvg',
  props: {
    name: {
      type: String,
      required: true,
    },
    stroke: {
      type: [String, Number],
      required: false,
    },
  },
  async setup(props, { slots }) {
    const nuxt = useNuxtApp()
    const options = useAppConfig().icon as NuxtIconRuntimeOptions
    const name = useResolvedName(() => props.name)

    const storeKey = 'i-' + name.value

    // On server side, we fetch the icon data and store it in the payload
    if (import.meta.server) {
      useAsyncData(
        storeKey,
        () => loadIcon(name.value),
        { deep: false },
      )
    }

    // On client side, we feed Iconify we the data we have from server side to avoid hydration mismatch
    if (import.meta.client) {
      const payload = nuxt.payload.data[storeKey]
      if (payload) {
        addIcon(name.value, payload)
      }
    }

    const updateStrokeWidth = (el) => {
      if (props.stroke === null) return
      el.querySelectorAll('[stroke-width]').forEach((el: HTMLElement) => {
        el.setAttribute('stroke-width', props.stroke)
      })
    }

    return () => h(Iconify, {
      icon: name.value,
      ssr: true,
      class: options.class,
      onVnodeMounted: ({ el }) => updateStrokeWidth(el),
      onVnodeUpdated: ({ el }) => updateStrokeWidth(el)
    }, slots)
  },
})
