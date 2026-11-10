<script setup lang="ts">
import { onServerPrefetch } from 'vue'
// an async boundary: the ids of its children depend on how many boundaries rendered before it
onServerPrefetch(() => {})
</script>

<template>
  <IdProbeChild />
</template>
