import type { PropType } from 'vue'
import { computed, defineComponent, h, mergeProps } from 'vue'
import type { NuxtIconRuntimeOptions } from '../../types'
import { NuxtIconCss } from './css'
import type { IconifyIconCustomizeCallback } from './name'
import { useResolvedName } from './name'
import { useAppConfig, useNuxtApp } from '#imports'
import { NuxtIconSvg, useSvgIconRenderer } from '#build/nuxt-icon-svg'

export default defineComponent({
  name: 'NuxtIcon',
  // The attributes are merged in the render function, as Vue would merge them, so the direct
  // svg path can read Iconify's customisations (`width`, `rotate`, `flip`…) from them.
  inheritAttrs: false,
  props: {
    name: {
      type: String,
      required: true,
    },
    mode: {
      type: String as PropType<'svg' | 'css'>,
      required: false,
      default: null,
    },
    size: {
      type: [Number, String],
      required: false,
      default: null,
    },
    customize: {
      type: [Function, Boolean, null] as PropType<IconifyIconCustomizeCallback | boolean | null>,
      default: null,
      required: false,
    },
  },
  setup(props, { attrs, slots }) {
    const nuxtApp = useNuxtApp()
    const runtimeOptions = useAppConfig().icon as NuxtIconRuntimeOptions
    const name = useResolvedName(() => props.name)
    const component = computed(() =>
      nuxtApp.vueApp?.component(name.value)
      || ((props.mode || runtimeOptions.mode) === 'svg'
        ? NuxtIconSvg
        : NuxtIconCss),
    )
    const style = computed(() => {
      const size = props.size || runtimeOptions.size
      return size
        ? { fontSize: Number.isNaN(+size) ? size : size + 'px' }
        : null
    })

    // In svg mode, an icon already in memory renders without `<NuxtIconSvg>` and Iconify.
    // `useSvgIconRenderer` is only defined when svg is the default mode, which keeps the
    // Iconify runtime out of the critical client JS in css mode.
    const canRenderDirect = () => (props.mode || runtimeOptions.mode) === 'svg'
      && !props.customize
      && !runtimeOptions.customize
    // Merged the way Vue merges fallthrough attributes, which it skips when there are none
    const withAttrs = (base: Record<string, unknown>) => {
      for (const _ in attrs)
        return mergeProps(base, attrs)
      return base
    }
    const directName = name.value
    const renderSvg = useSvgIconRenderer
      && name.value
      && !nuxtApp.vueApp?.component(name.value)
      && canRenderDirect()
      ? useSvgIconRenderer(directName)
      : undefined

    return () =>
      // `mode`, `customize` and `name` may change after setup: the renderer only covers the initial ones
      (renderSvg && name.value === directName && canRenderDirect()
        && renderSvg(withAttrs({ ...runtimeOptions.attrs, class: runtimeOptions.class, style: style.value })))
      || h(
        component.value,
        mergeProps(
          {
            ...runtimeOptions.attrs,
            name: name.value,
            class: runtimeOptions.class,
            style: style.value,
            customize: props.customize,
          },
          attrs,
          // `attrs` holds none of the props in an app, but does with `mountSuspended` in tests
          { name: name.value, customize: props.customize },
        ),
        slots,
      )
  },
})
