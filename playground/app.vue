<template>
  <div>
    <p>
      Sizes:
      <Icon name="uil:github" />
      <Icon name="uil:github" size="24" />
      <Icon name="uil:github" size="48" />
    </p>
    <p>
      Custom component:
      <Icon name="NuxtIcon" />
      <Icon name="NuxtIcon" size="24" />
      <Icon name="NuxtIcon" size="48" />
    </p>
    <p>
      Emoji:
      <Icon name="🚀" />
      <Icon name="🚀" size="24" />
      <Icon name="🚀" size="48" />
    </p>
    <p>
      Aliases:
      <Icon name="awesome-github" />
      <Icon name="awesome-nuxt" />
      <Icon name="awesome-rocket" />
    </p>
  </div>
</template>

<style scoped>
p {
  display: flex;
  align-items: center;
  gap: 1em;
}
</style>
