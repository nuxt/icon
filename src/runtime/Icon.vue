<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type { PropType } from 'vue'
import type { IconifyIcon } from '@iconify/vue'
import { Icon as Iconify } from '@iconify/vue/dist/offline'
import { loadIcon } from '@iconify/vue'
import { useNuxtApp, useState, ref, useAppConfig, computed, watch } from '#imports'

const nuxtApp = useNuxtApp()
const appConfig = useAppConfig()

// @ts-ignore
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

const state = useState<Record<string, IconifyIcon | undefined>>('icons', () => ({}))
const isFetching = ref(false)
const iconName = computed(() => ((appConfig as any)?.nuxtIcon?.aliases || {})[props.name] || props.name)
const icon = computed<IconifyIcon | undefined>(() => state.value?.[iconName.value])
const component = computed(() => nuxtApp.vueApp.component(iconName.value))
const sSize = computed(() => {
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
  if (!state.value?.[iconName.value]) {
    isFetching.value = true
    state.value[iconName.value] = await loadIcon(iconName.value).catch(() => undefined)
    isFetching.value = false
  }
}

watch(() => iconName.value, loadIconComponent)

!component.value && await loadIconComponent()
</script>

<template>
  <span v-if="isFetching" :class="className" :width="sSize" :height="sSize" />
  <Iconify v-else-if="icon" :icon="icon" :class="className" :width="sSize" :height="sSize" />
  <Component :is="component" v-else-if="component" :class="className" :width="sSize" :height="sSize" />
  <span v-else :class="className" :style="{ fontSize: sSize, lineHeight: sSize, width: sSize, height: sSize }">{{ name }}</span>
</template>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
}
</style>
