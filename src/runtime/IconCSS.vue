<script setup lang="ts">
import { computed } from 'vue'
import { useAppConfig } from '#imports'
import { resolveIconName } from './utils'

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

const iconName = computed(() => {
  if (appConfig.nuxtIcon?.aliases?.[props.name]) {
    return appConfig.nuxtIcon.aliases[props.name]
  }
  return props.name
})
const resolvedIcon = computed(() => resolveIconName(iconName.value))
const iconUrl = computed(() => {
  const customUrl = appConfig.nuxtIcon?.iconifyApiOptions?.url

  if (customUrl) {
    // validate the custom Iconify API URL
    try {
      new URL(customUrl)
    } catch (e) {
      console.warn('Nuxt IconCSS: Invalid custom Iconify API URL')
      return
    }
  }

  const baseUrl = customUrl || 'https://api.iconify.design'
  return `url('${baseUrl}/${resolvedIcon.value.prefix}/${resolvedIcon.value.name}.svg')`
})
const sSize = computed(() => {
  // Disable size if appConfig.nuxtIcon.size === false
  if (!props.size && typeof appConfig.nuxtIcon?.size === 'boolean' && !appConfig.nuxtIcon?.size) {
    return undefined
  }
  const size = props.size || appConfig.nuxtIcon?.size || '1em'
  if (String(Number(size)) === size) {
    return `${size}px`
  }
  return size
})
</script>

<template>
  <span :style="{ width: sSize, height: sSize }" />
</template>

<style scoped>
span {
  display: inline-block;
  vertical-align: middle;
  background-color: currentColor;
  -webkit-mask-image: v-bind(iconUrl);
  mask-image: v-bind(iconUrl);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}
</style>
