<script setup lang="ts">
// `<Icon>` with `customize` always renders through `<NuxtIconSvg>` and Iconify's `<Icon>`
const keep = (content: string) => content
</script>

<template>
  <div>
    <div data-case="plain">
      <Icon name="ph:acorn-bold" />
      <Icon
        name="ph:acorn-bold"
        :customize="keep"
      />
    </div>
    <div data-case="size">
      <Icon
        name="ph:acorn-bold"
        size="32"
        class="extra"
      />
      <Icon
        name="ph:acorn-bold"
        size="32"
        class="extra"
        :customize="keep"
      />
    </div>
    <div data-case="width">
      <Icon
        name="ph:acorn-bold"
        width="48"
      />
      <Icon
        name="ph:acorn-bold"
        width="48"
        :customize="keep"
      />
    </div>
    <div data-case="rotate">
      <Icon
        name="ph:acorn-bold"
        rotate="90deg"
      />
      <Icon
        name="ph:acorn-bold"
        rotate="90deg"
        :customize="keep"
      />
    </div>
    <div data-case="flip">
      <Icon
        name="ph:acorn-bold"
        flip="horizontal"
      />
      <Icon
        name="ph:acorn-bold"
        flip="horizontal"
        :customize="keep"
      />
    </div>
    <div data-case="h-flip">
      <Icon
        name="ph:acorn-bold"
        h-flip
      />
      <Icon
        name="ph:acorn-bold"
        h-flip
        :customize="keep"
      />
    </div>
    <div data-case="inline">
      <Icon
        name="ph:acorn-bold"
        inline
      />
      <Icon
        name="ph:acorn-bold"
        inline
        :customize="keep"
      />
    </div>
    <div data-case="color">
      <Icon
        name="ph:acorn-bold"
        color="red"
        style="opacity: 0.5"
      />
      <Icon
        name="ph:acorn-bold"
        color="red"
        style="opacity: 0.5"
        :customize="keep"
      />
    </div>
    <div data-case="aria">
      <Icon
        name="ph:acorn-bold"
        :aria-hidden="false"
        aria-label="Acorn"
        title="Acorn"
      />
      <Icon
        name="ph:acorn-bold"
        :aria-hidden="false"
        aria-label="Acorn"
        title="Acorn"
        :customize="keep"
      />
    </div>
  </div>
</template>
