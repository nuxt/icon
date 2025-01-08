import { addIcon, getIcon as _getIcon } from '@iconify/vue'
import { computed, watch, h, defineComponent } from 'vue'
import { getIconCSS } from '@iconify/utils/lib/css/icon'
import type { PropType } from 'vue'
import type { IconifyIcon } from '@iconify/types'
import type { NuxtIconRuntimeOptions, NuxtIconRuntimeServerOptions, IconifyIconCustomizeCallback } from '../../types'
import { loadIcon, useResolveCustomization } from './shared'
import { useAppConfig, useNuxtApp, useHead, useRuntimeConfig, onServerPrefetch } from '#imports'

// This should only be used in the client side
let cssSelectors: Set<string> | undefined
const SYMBOL_SERVER_CSS = 'NUXT_ICONS_SERVER_CSS'

function escapeCssSelector(selector: string) {
  return selector.replace(/([^\w-])/g, '\\$1')
}

function getAllSelectors() {
  if (cssSelectors)
    return cssSelectors

  cssSelectors = new Set<string>()

  const filter = (selector: string): string | undefined => {
    selector = selector
      .replace(/^:where\((.*)\)$/, '$1')
      .trim()
    if (selector.startsWith('.')) {
      return selector
    }
  }

  const scanCssRules = (rules: CSSRuleList) => {
    if (!rules?.length)
      return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const rule of (rules as any)) {
      // scan for nested rules
      if (rule?.cssRules) {
        scanCssRules(rule.cssRules)
      }
      // scan for selector
      const selectorRaw = rule?.selectorText
      if (typeof selectorRaw === 'string') {
        const selector = filter(selectorRaw)
        if (selector)
          cssSelectors!.add(selector)
      }
    }
  }

  if (typeof document !== 'undefined') {
    for (const styleSheet of document.styleSheets) {
      try {
        const rules = styleSheet.cssRules || styleSheet.rules
        scanCssRules(rules)
      }
      catch {
        // this typically means the stylesheet is from an inaccessible origin
      }
    }
  }

  return cssSelectors
}

export const NuxtIconCss = /* @__PURE__ */ defineComponent({
  name: 'NuxtIconCss',
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
  setup(props) {
    const nuxt = useNuxtApp()
    const options = useAppConfig().icon as NuxtIconRuntimeOptions
    const cssClass = computed(() => props.name ? options.cssSelectorPrefix + props.name : '')

    function getIcon(name: string) {
      if (!name)
        return
      const icon = _getIcon(name)
      if (icon)
        return icon
      const payload = nuxt.payload?.data?.[name]
      if (payload) {
        addIcon(name, payload)
        return payload
      }
    }

    const selector = computed(() => '.' + escapeCssSelector(cssClass.value))

    function getCSS(icon: IconifyIcon, withLayer = true) {
      let iconSelector = selector.value
      if (options.cssWherePseudo) {
        iconSelector = `:where(${iconSelector})`
      }

      const css = getIconCSS(icon, {
        iconSelector,
        format: 'compressed',
        customise: useResolveCustomization(props.customize, options.customize),
      })
      if (options.cssLayer && withLayer) {
        return `@layer ${options.cssLayer} { ${css} }`
      }
      return css
    }

    if (import.meta.client) {
      const selectors = getAllSelectors()

      async function mountCSS(icon: IconifyIcon) {
        if (selectors.has(selector.value))
          return
        if (typeof document === 'undefined')
          return
        const style = document.createElement('style')
        style.textContent = getCSS(icon)
        if (import.meta.dev) {
          style.dataset.nuxtIconDev = props.name
        }
        const firstStyle = document.head.querySelector('style, link[rel="stylesheet"]')
        if (firstStyle)
          document.head.insertBefore(style, firstStyle)
        else
          document.head.appendChild(style)
        selectors.add(selector.value)
      }

      watch(
        () => props.name,
        () => {
          if (selectors.has(selector.value)) {
            return
          }
          const data = getIcon(props.name)
          if (data) {
            mountCSS(data)
          }
          else {
            loadIcon(props.name, import.meta.server ? options.fetchTimeout : -1)
              .then((data) => {
                if (data)
                  mountCSS(data)
              })
              .catch(() => null)
          }
        },
        { immediate: true },
      )
    }

    // We need to always call this hook to make use Vue correctly detect this component as async
    // This makes sure `useId` is consistent across server and client
    // @see https://github.com/nuxt/icon/issues/310
    onServerPrefetch(async () => {
      // For dead code elimination
      if (import.meta.server) {
        const configs = (useRuntimeConfig().icon || {}) as NuxtIconRuntimeServerOptions
        if (!configs?.serverKnownCssClasses?.includes(cssClass.value)) {
          const icon = await loadIcon(props.name, options.fetchTimeout).catch(() => null)
          if (!icon)
            return null
          let ssrCSS: Map<string, string> = nuxt.vueApp._context.provides[SYMBOL_SERVER_CSS]
          if (!ssrCSS) {
            ssrCSS = nuxt.vueApp._context.provides[SYMBOL_SERVER_CSS] = new Map()
            // Bulk all CSS into one tag
            nuxt.runWithContext(() => {
              useHead({
                style: [
                  () => {
                    const sep = import.meta.dev ? '\n' : ''
                    let css = Array.from(ssrCSS.values()).sort().join(sep)
                    if (options.cssLayer) {
                      css = `@layer ${options.cssLayer} {${sep}${css}${sep}}`
                    }
                    return { innerHTML: css }
                  },
                ],
              }, {
                tagPriority: 'low',
              })
            })
          }
          // Dedupe CSS
          if (props.name && !ssrCSS.has(props.name)) {
            const css = getCSS(icon, false)
            ssrCSS.set(props.name, css)
          }
          return null
        }
      }
    })

    return () => h('span', { class: ['iconify', cssClass.value] })
  },
})
