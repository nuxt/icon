<script setup lang="ts">
import type { PropType } from 'vue'
import { computed } from 'vue'
import { useAppConfig } from '#imports'

const appConfig = useAppConfig()
const aliases = appConfig?.nuxtIcon?.aliases || {}

type AliasesKeys = keyof typeof aliases

const props = defineProps({
  name: {
    type: String as PropType<AliasesKeys | (string & {})>,
    required: true
  },
  size: {
    type: String,
    default: ''
  }
})

const iconName = computed(() => ((appConfig as any)?.nuxtIcon?.aliases || {})[props.name] || props.name)
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
