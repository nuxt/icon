<script setup lang="ts">
const bold = (content: string) => content.replace(/stroke-width="[^"]*"/g, 'stroke-width="3"')
</script>

<template>
  <Icon
    name="ph:alarm"
    :customize="bold"
  />
</template>
