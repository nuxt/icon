<script setup lang="ts">
import { onMounted, useId } from 'vue'

const id = useId()
onMounted(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__probeId = id
})
</script>

<template>
  <p
    id="probe"
    :data-id="id"
  >
    probe
  </p>
</template>
