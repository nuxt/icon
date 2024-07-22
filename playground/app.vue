<script setup lang="ts">
import { ref } from 'vue'
import collections from '@iconify/collections/collections.json'
import { useCookie } from '#imports'

const sampleIcons = Object.entries(collections)
  .flatMap(([collection, value]) => value.samples.map(icon => `${collection}:${icon}`))

function randomePick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const mode = useCookie<'svg' | 'css'>('nuxt-icon-demo-mode', {
  default: () => 'css',
})
const iconsRaw = useCookie<string[]>('nuxt-icon-demo-icons', {
  default: () => ['logos-nuxt-icon', 'logos-vitejs', 'logos-vue'],
})
const stroke = useCookie<number>('nuxt-icon-demo-stroke', {
  default: () => 0.5,
})

const customize = (content: string) => {
  return content.replace(/stroke-width="[^"]*"/g, `stroke-width="${stroke.value}"`)
}

const icons = ref<string[]>(iconsRaw.value)

const input = ref('')

const commit = (value = input.value) => {
  if (value) {
    icons.value.unshift(value)
    iconsRaw.value = icons.value
    input.value = ''
  }
}

function addRandom() {
  commit(randomePick(sampleIcons))
}

function clear() {
  icons.value = []
  iconsRaw.value = icons.value
  stroke.value = 0.5
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex gap-4 items-center">
      <div>Nuxt Icon PoC Demo</div>
      <select v-model="mode">
        <option value="svg">
          SVG
        </option>
        <option value="css">
          CSS
        </option>
      </select>
      <div class="flex gap-2 mb-0.5 items-center">
        <div>Stroke:</div>
        <input
          v-model="stroke"
          type="range"
          class="mt-1.5"
          min="0.5"
          step="0.1"
          max="3"
        >
      </div>
      <button
        class="flex items-center gap-1"
        @click="addRandom"
      >
        <Icon
          name="i-ph-dice-five-duotone"
          class="text-xl"
        />
        Add Random
      </button>
      <button
        class="flex items-center gap-1"
        @click="clear"
      >
        <Icon
          name="i-ph-trash-duotone"
          class="text-xl"
        />
        Clear
      </button>
    </div>
    <input
      v-model="input"
      class="px2 py1 text-lg font-mono"
      placeholder="Type iconify icon id, press enter to render"
      @keydown.enter="commit()"
    >
    <div class="flex flex-wrap gap-4">
      <div
        v-for="icon in icons"
        :key="icon"
        class="flex flex-col items-center gap-1"
      >
        <!-- Icon -->
        <div class="text-xs font-mono opacity-50">
          {{ mode }}
        </div>
        <div class="flex border border-solid border-hex-8885 rounded p2 text-4em">
          <Icon
            :name="icon"
            :mode="mode"
            :customize
          />
        </div>
        <div class="text-xs font-mono opacity-50">
          {{ icon }}
        </div>
      </div>
    </div>

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
      <!-- <p>
        Emoji:
        <Icon name="🚀" />
        <Icon
          name="🚀"
          size="24"
        />
        <Icon
          name="🚀"
          size="48"
        />
      </p> -->
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
          name="i-fluent-emoji-high-contrast-1st-place-medal"
          :mode
          :customize
        />
      </p>
      <!-- <p>
        Failing:
        <Icon name="uil:bad">
          ☀️
        </Icon>
        <Icon name="uil:bad" />
        <Icon name="i-uil-bad" />
      </p> -->
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
  </div>
</template>

<style>
html {
  color-scheme: dark;
  margin: 0;
  font-family: system-ui;
}
body {
  margin: 0;
  padding: 1rem;
}
.iconify {
  display: inline-block;
}
</style>
