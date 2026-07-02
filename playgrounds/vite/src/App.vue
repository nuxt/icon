<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref } from 'vue'

const online = ref(navigator.onLine)
window.addEventListener('online', () => online.value = true)
window.addEventListener('offline', () => online.value = false)
</script>

<template>
  <main style="font-family: sans-serif; max-width: 40rem; margin: 2rem auto; line-height: 1.6">
    <h1>@nuxt/icon — Vite playground</h1>
    <p>
      Icons below are pre-bundled at build time by <code>@nuxt/icon/vite</code>
      and render offline, without requests to <code>api.iconify.design</code>
      (currently <strong>{{ online ? 'online' : 'offline' }}</strong> — try
      going offline in the devtools and reloading).
    </p>

    <h2>Explicitly bundled</h2>
    <p>
      Listed in <code>icons</code> in <code>vite.config.ts</code>:
      <Icon icon="uil:github" />
    </p>

    <h2>Bundled by scanning</h2>
    <p>
      Literal usages found in this file:
      <Icon icon="ph:acorn" />
      <Icon icon="ph:activity" />
      <Icon icon="ph:alarm-duotone" />
    </p>

    <h2>Custom collection</h2>
    <p>
      SVG files from the local <code>icons/</code> directory:
      <Icon icon="custom:nuxt" />
      <Icon icon="custom:nuxt-v1" />
    </p>

    <h2>Not bundled</h2>
    <p>
      <code>@iconify-json/mdi</code> is not installed, so this icon falls back
      to runtime loading from the Iconify API (it disappears offline):
      <Icon icon="mdi:home" />
    </p>
  </main>
</template>
