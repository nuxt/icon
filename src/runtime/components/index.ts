import type { PropType } from 'vue'
import { computed, defineComponent, h } from 'vue'
import type { NuxtIconRuntimeOptions } from '../../types'
import { NuxtIconCss } from './css'
import type { IconifyIconCustomizeCallback } from './name'
import { useResolvedName } from './name'
import { useAppConfig, useNuxtApp } from '#imports'
import { NuxtIconSvg, useSvgIconRenderer } from '#build/nuxt-icon-svg'

export default defineComponent({
  name: 'NuxtIcon',
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
  setup(props, { slots }) {
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
    const directName = name.value
    const renderSvg = useSvgIconRenderer
      && name.value
      && !nuxtApp.vueApp?.component(name.value)
      && (props.mode || runtimeOptions.mode) === 'svg'
      && !props.customize
      && !runtimeOptions.customize
      ? useSvgIconRenderer(directName)
      : undefined

    return () => (renderSvg && name.value === directName && renderSvg({ ...runtimeOptions.attrs, class: runtimeOptions.class, style: style.value }))
      || h(
        component.value,
        {
          ...runtimeOptions.attrs,
          name: name.value,
          class: runtimeOptions.class,
          style: style.value,
          customize: props.customize,
        },
        slots,
      )
  },
})
