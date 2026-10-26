<script setup lang="ts">
const thin = (content: string) => content.replace(/stroke-width="[^"]*"/g, 'stroke-width="1"')
</script>

<template>
  <div>
    <Icon
      name="ph:acorn-bold"
      :customize="thin"
    />
    <ClientOnly>
      <Icon
        name="ph:acorn-bold"
        :customize="thin"
      />
    </ClientOnly>
    <div id="lazy">
      <LazyBoldIcon hydrate-on-interaction />
    </div>
  </div>
</template>
