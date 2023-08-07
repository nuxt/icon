<script setup lang="ts">
import { computed } from 'vue'
import { useAppConfig } from '#imports'

const appConfig = useAppConfig()

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

const iconName = computed(() => ((appConfig.nuxtIcon?.aliases || {})[props.name] || props.name).replace(/^i-/, ''))
const iconUrl = computed(() => `url('https://api.iconify.design/${iconName.value.replace(':', '/')}.svg')`)
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
