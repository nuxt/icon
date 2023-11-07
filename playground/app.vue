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
      <Icon name="nxt" size="24" />
    </p>
    <p>
      CSS:
      <IconCSS name="uil:github" size="24" />
      <IconCSS name="i-ph-rocket" size="48" />
      <IconCSS name="nuxt" size="48" style="color: #00DC82;" />
    </p>
    <p>
      `i-` syntax:
      <Icon name="i-fluent-emoji-high-contrast-1st-place-medal" />
      <IconCSS name="i-fluent-emoji-high-contrast-1st-place-medal" />
    </p>
    <p>
      Failing:
      <Icon name="uil:bad">
        ☀️
      </Icon>
      <Icon name="uil:bad" />
      <IconCSS name="uil:bad" />
      <Icon name="i-uil-bad" />
      <IconCSS name="i-uil-bad" />
    </p>
    <p>
      Specials:
      <Icon name="i-ph-code" />
      <Icon name="ph:table" />
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
