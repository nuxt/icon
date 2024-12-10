<script setup lang="ts">
import type { IconifyIconCustomizeCallback } from '../../src/types'

defineProps<{
  mode?: 'svg' | 'css'
  customize?: IconifyIconCustomizeCallback
}>()
</script>

<template>
  <div class="border border-solid border-gray/10 p4 rounded-lg mt-20">
    <div class="opacity-50">
      Fixtures
    </div>
    <p>
      Sizes:
      <Icon
        name="uil:github"
        :mode
        :customize
      />
      <Icon
        name="uil:github"
        size="24"
        :mode
        :customize
      />
      <Icon
        name="uil:github"
        size="48"
        :mode
        :customize
      />
    </p>
    <p>
      Global components:
      <Icon
        name="NuxtLogo"
        :mode
        :customize
      />
      <Icon
        name="NuxtLogo"
        size="24"
        :mode
        :customize
      />
      <Icon
        name="NuxtLogo"
        size="48"
        :mode
        :customize
      />
    </p>
    <p>
      Custom icons from local fs:
      <Icon
        name="custom1:nuxt-v1"
        size="64"
        :mode
        :customize
      />
      <Icon
        name="custom1:nuxt-v2"
        size="64"
        :mode
      />
      <Icon
        name="custom1:nuxt-v3-beta"
        size="64"
        :mode
        :customize
      />
      <Icon
        name="custom1:nuxt-v3"
        size="64"
        :mode
        :customize
      />
      <Icon
        name="custom1:Foo_Bar_Zag"
        size="64"
        :mode
        :customize
      />
      <Icon
        name="custom1:Foo.BarZag"
        size="64"
        :mode
        :customize
      />
    </p>
    <p>
      Custom icons with `prefix: ''` from local fs:
      <Icon
        name="nuxt-v3"
        size="32"
        :mode
        :customize
      />
    </p>
    <p>
      Custom icons with `prefix: 'custom-parts'` from local fs:
      <Icon
        name="custom-parts-nuxt-v3"
        size="32"
        :mode
        :customize
      />
    </p>
    <p>
      Custom icons from layer:
      <Icon
        name="layer:layer"
        size="64"
        :mode
        :customize
      />
    </p>
    <p>
      Aliases:
      <Icon
        name="github"
        size="24"
        :mode
        :customize
      />
      <Icon
        name="nuxt"
        size="24"
        :mode
        :customize
      />
      <Icon
        name="rocket"
        size="24"
        :mode
        :customize
      />
      <Icon
        name="nxt"
        size="24"
        :customize
      />
    </p>
    <p>
      `i-` syntax:
      <Icon
        name="i-solar:medal-ribbon-bold-duotone"
        :mode
        :customize
      />
    </p>
    <p>
      Failing:
      <Icon name="uil:bad">
        ☀️
      </Icon>
      <Icon name="uil:bad" />
      <Icon name="i-uil-bad" />
    </p>
    <p>
      Specials:
      <Icon
        name="i-ph-code"
        :mode
        :customize
      />
      <Icon
        name="ph:table"
        :mode
        :customize
      />
    </p>
  </div>
</template>
