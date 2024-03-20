<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type { IconifyIcon } from '@iconify/vue'
import { Icon as Iconify } from '@iconify/vue/dist/offline'
import { loadIcon, addAPIProvider } from '@iconify/vue'
import { ref, computed, watch } from 'vue'
import { useAppConfig, useNuxtApp, useState } from '#imports'
import { resolveIconName } from './utils'

const nuxtApp = useNuxtApp()
const appConfig = useAppConfig() as {
  nuxtIcon: {
    size?: string
    class?: string
    aliases?: Record<string, string>
    iconifyApiOptions?: {
      url?: string
      publicApiFallback?: boolean
    }
  }
}

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: ''
  }
})

watch(() => appConfig.nuxtIcon?.iconifyApiOptions, () => {
  if (!appConfig.nuxtIcon?.iconifyApiOptions?.url) return

  // validate the custom Iconify API URL
  try {
    new URL(appConfig.nuxtIcon.iconifyApiOptions.url)
  } catch (e) {
    console.warn('Nuxt Icon: Invalid custom Iconify API URL')
    return
  }

  // don't override the default public api if publicApiFallback is enabled. See more: https://iconify.design/docs/api/providers.html
  if (appConfig.nuxtIcon?.iconifyApiOptions?.publicApiFallback) {
    addAPIProvider('custom', {
      resources: [appConfig.nuxtIcon?.iconifyApiOptions.url],
      index: 0
    })
    return
  }

  // override the default public api to force the use of the custom API
  addAPIProvider('', {
    resources: [appConfig.nuxtIcon?.iconifyApiOptions.url],
  })
}, { immediate: true })

const state = useState<Record<string, IconifyIcon | undefined>>('icons', () => ({}))
const isFetching = ref(false)
const iconName = computed(() => {
  if (appConfig.nuxtIcon?.aliases?.[props.name]) {
    return appConfig.nuxtIcon.aliases[props.name]!
  }
  return props.name
})
const resolvedIcon = computed(() => resolveIconName(iconName.value))
const iconKey = computed(() => [resolvedIcon.value.provider, resolvedIcon.value.prefix, resolvedIcon.value.name].filter(Boolean).join(':'))
const icon = computed<IconifyIcon | undefined>(() => state.value?.[iconKey.value])
const component = computed(() => nuxtApp.vueApp?.component(iconName.value))
const sSize = computed(() => {
  // Disable size if appConfig.nuxtIcon.size === false
  // @ts-ignore
  if (!props.size && typeof appConfig.nuxtIcon?.size === 'boolean' && !appConfig.nuxtIcon?.size) {
    return undefined
  }
  // @ts-ignore
  const size = props.size || appConfig.nuxtIcon?.size || '1em'
  if (String(Number(size)) === size) {
    return `${size}px`
  }
  return size
})
const className = computed(() => (appConfig as any)?.nuxtIcon?.class ?? 'icon')

async function loadIconComponent () {
  if (component.value) {
    return
  }
  if (!state.value?.[iconKey.value]) {
    isFetching.value = true
    state.value[iconKey.value] = await loadIcon(resolvedIcon.value).catch(() => undefined)
    isFetching.value = false
  }
}

watch(iconName, loadIconComponent)

!component.value && await loadIconComponent()
</script>

<template>
  <span v-if="isFetching" :class="className" :style="{ width: sSize, height: sSize }" />
  <Iconify v-else-if="icon" :icon="icon" :class="className" :width="sSize" :height="sSize" />
  <Component :is="component" v-else-if="component" :class="className" :width="sSize" :height="sSize" />
  <span v-else :class="className" :style="{ fontSize: sSize, lineHeight: sSize, width: sSize, height: sSize }"><slot>{{ name }}</slot></span>
</template>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
}
</style>
