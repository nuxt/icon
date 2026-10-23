<script setup lang="ts">
import { useAppConfig } from '#imports'

const provider = JSON.stringify(useAppConfig().icon.provider)
</script>

<template>
  <div>
    <Icon name="ph:acorn-bold" />
    <pre id="provider">{{ provider }}</pre>
  </div>
</template>
