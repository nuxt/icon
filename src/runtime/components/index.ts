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

    return () => h(
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
