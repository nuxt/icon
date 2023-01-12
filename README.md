![nuxt-icon](https://user-images.githubusercontent.com/904724/188514727-e252b825-be56-43bb-a044-5a97f9a3badc.png)

# Nuxt Icon

[![npm version][npm-version-src]][npm-version-href]
[![License][license-src]][license-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
<a href="https://volta.net/nuxt-modules/icon?utm_source=nuxt_icon_readme"><img src="https://user-images.githubusercontent.com/904724/209143798-32345f6c-3cf8-4e06-9659-f4ace4a6acde.svg" alt="Volta board"></a>

> Icon module for [Nuxt](https://v3.nuxtjs.org) with [100,000+ ready to use icons](https://icones.js.org) from Iconify.

- [✨ &nbsp;Release Notes](https://github.com/nuxt-modules/icon/releases)
- [🏀 &nbsp;Online playground](https://stackblitz.com/edit/nuxt-icon-playground?file=app.vue)

## Features ✨

- Nuxt 3 ready
- Support 100,000 open source vector icons via [Iconify](https://iconify.design)
- Emoji Support
- Custom SVG support (via Vue component)

## Setup ⛓️

Add `nuxt-icon` dependency to your project:

```bash
npm install --save-dev nuxt-icon

# Using yarn
yarn add --dev nuxt-icon
```

Add it to the `modules` array in your `nuxt.config.ts`:

```ts
import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  modules: ['nuxt-icon']
})
```

That's it, you can now use the `<Icon />` in your components!

✨ If you are using VS Code, you can use the [Iconify IntelliSense](https://marketplace.visualstudio.com/items?itemName=antfu.iconify) extension by [@antfu](https://github.com/antfu)

## Usage 👌

**Props:**
- `name` (required): icon name, emoji or global component name
- `size`: icon size (default: `1em`)

### Iconify dataset

You can use any name from the https://icones.js.org collection:

```html
<Icon name="uil:github" />
```

### Emoji

```html
<Icon name="🚀" />
```

### Vue component

```html
<Icon name="NuxtIcon" />
```

Note that `NuxtIcon` needs to be inside `components/global/` folder (see [example](./playground/components/global/NuxtIcon.vue)).

## Configuration ⚙️

To update the default size (`1em`) of the `<Icon />`, create an `app.config.ts` with the `nuxtIcon.size` property.

Update the default class (`.icon`) of the `<Icon />` with the `nuxtIcon.class` property, for a headless Icon, simply set `nuxtIcon.class: ''`.

You can also define aliases to make swapping out icons easier by leveraging the `nuxtIcon.aliases` property.

```ts
// app.config.ts
export default defineAppConfig({
  nuxtIcon: {
    size: '24px', // default <Icon> size applied
    class: 'icon', // default <Icon> class applied
    aliases: {
      'nuxt': 'logos:nuxt-icon',
    }
  }
})
```

The icons will have the default size of `24px` and the `nuxt` icon will be available:

```html
<Icon name="nuxt" />
```

## Render Function

You can use the `Icon` component in a render function (useful if you create a functional component), for this you can import it from `#components`:

```ts
import { Icon } from '#components'
```

See an example of a `<MyIcon>` component:

```vue
<script setup>
import { Icon } from '#components'

const MyIcon = h(Icon, { name: 'uil:twitter' })
</script>

<template>
  <p><MyIcon /></p>
</template>
```

## Contributing 🙏

1. Clone this repository
2. Install dependencies using `pnpm install` (install `pnpm` with `corepack enable`, [learn more](https://pnpm.io/installation#using-corepack))
3. Run `npm run dev:prepare` to generate type stubs.
4. Use `npm run dev` to start [playground](./playground) in development mode.

## Credits 💌

- [@benjamincanac](https://github.com/benjamincanac) for the initial version
- [@cyberalien](https://github.com/cyberalien) for making [Iconify](https://github.com/iconify/iconify)

## License 📎

[MIT License](./LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-icon/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt-icon

[npm-downloads-src]: https://img.shields.io/npm/dt/nuxt-icon.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt-icon

[license-src]: https://img.shields.io/github/license/nuxt-modules/icon.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://github.com/nuxt-modules/icon/blob/main/LICENSE
