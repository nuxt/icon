import { getIcon as _getIcon } from '@iconify/vue'
import type { PropType } from 'vue'
import { computed, defineComponent, h } from 'vue'
import type { NuxtIconRuntimeOptions, IconifyIconCustomizeCallback } from '../../types'
import { NuxtIconCss } from './css'
import { NuxtIconSvg } from './svg'
import { useResolvedName } from './shared'
import { useAppConfig, useNuxtApp } from '#imports'

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
      type: Function as PropType<IconifyIconCustomizeCallback>,
      required: false,
    },
  },
  async setup(props, { slots }) {
    const nuxtApp = useNuxtApp()
    const options = useAppConfig().icon as NuxtIconRuntimeOptions
    const name = useResolvedName(() => props.name)
    const component = computed(() =>
      nuxtApp.vueApp?.component(name.value)
      || ((props.mode || options.mode) === 'svg'
        ? NuxtIconSvg
        : NuxtIconCss),
    )
    const style = computed(() => {
      const size = props.size || options.size
      return size
        ? { fontSize: Number.isNaN(+size) ? size : size + 'px' }
        : null
    })
    const customize = props.customize || options.customize

    return () => h(
      component.value,
      {
        ...options.attrs,
        name: name.value,
        class: options.class,
        style: style.value,
        customize,
      },
      slots,
    )
  },
})
