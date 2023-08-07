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
      <Icon name="github" size="24" />
      <Icon name="nuxt" size="24" />
      <Icon name="rocket" size="24" />
    </p>
    <p>
      CSS:
      <IconCSS name="i-uil-github" />
      <IconCSS name="uil:github" size="24" />
      <IconCSS name="uil:github" size="48" />
      <IconCSS name="nuxt" size="48" style="color: #00DC82;" />
    </p>
    <p>
      Failing:
      <Icon name="uil:bad">
        ☀️
      </Icon>
      <Icon name="uil:bad" />
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
