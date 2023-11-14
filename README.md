![nuxt-icon](https://github.com/nuxt-modules/icon/assets/904724/ae673805-06ad-4c05-820e-a8445c7224ce)

# Nuxt Icon

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]
<a href="https://volta.net/nuxt-modules/icon?utm_source=nuxt_icon_readme"><img src="https://user-images.githubusercontent.com/904724/209143798-32345f6c-3cf8-4e06-9659-f4ace4a6acde.svg" alt="Volta board"></a>

Add [200,000+ ready to use icons](https://icones.js.org) to your [Nuxt](https://nuxt.com) application, based on [Iconify](https://iconify.design).

- [✨ &nbsp;Release Notes](https://github.com/nuxt-modules/icon/releases)
- [🏀 &nbsp;Online playground](https://stackblitz.com/edit/nuxt-icon-playground?file=app.vue)

## Features ✨

- Nuxt 3 ready
- Support 200,000 open source vector icons via [Iconify](https://iconify.design)
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

**Attributes**:

When using an icon from Iconify, an `<svg>` will be created, you can give [all the attributes](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute) of the native element.

```html
<Icon name="uil:github" color="black" />
```

### Iconify dataset

You can use any name from the https://icones.js.org collection:

```html
<Icon name="uil:github" />
```

It supports the `i-` prefix (for example `i-uil-github`).

### Emoji

```html
<Icon name="🚀" />
```

### Vue component

```html
<Icon name="NuxtIcon" />
```

Note that `NuxtIcon` needs to be inside `components/global/` folder (see [example](https://github.com/nuxt-modules/icon/blob/main/playground/components/global/NuxtIcon.vue)).

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

By default, this module will fetch the Icons from [the official Iconify API](https://api.iconify.design). You can change this behavior by setting the `nuxtIcon.iconifyApiOptions.url` property to [your own Iconify API](https://iconify.design/docs/api/hosting.html).

You can also set `nuxtIcon.iconifyApiOptions.publicApiFallback` to `true` to use the public API as a fallback (only for the `<Icon>` component, not for the `<IconCSS>` component`)

```ts
// app.config.ts
export default defineAppConfig({
  nuxtIcon: {
    // ...
    iconifyApiOptions: {
      url: 'https://<your-api-url>',
      publicApiFallback: true // default: false
    }
  }
})
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

## CSS Icons

This is currently experimental and may change in the future, this is a way to use CSS icons instead of SVG icons to reduce the DOM size and improve performance. It is leveraging the Mask combined with background color set to `currentColor`, useful to render monotone icons that use `currentColor` as icon color. Learn more on https://docs.iconify.design/icon-components/css.html

```vue
<template>
  <IconCSS name="uil:twitter" />
</template>
```

You can use aliases in `<IconCSS>` as well.

Note that CSS Masks have limited support, see https://caniuse.com/css-masks for more information.

Also, the icons won't be loaded on initial load and an HTTP request will be made to Iconify CDN to load them.


## Contributing 🙏

1. Clone this repository
2. Install dependencies using `pnpm install` (install `pnpm` with `corepack enable`, [learn more](https://pnpm.io/installation#using-corepack))
3. Run `npm run dev:prepare` to generate type stubs.
4. Use `npm run dev` to start [playground](https://github.com/nuxt-modules/icon/tree/main/playground) in development mode.

## Credits 💌

- [@benjamincanac](https://github.com/benjamincanac) for the initial version
- [@cyberalien](https://github.com/cyberalien) for making [Iconify](https://github.com/iconify/iconify)

## License 📎

[MIT License](https://github.com/nuxt-modules/icon/blob/main/LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-icon/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt-icon

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-icon.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt-icon

[license-src]: https://img.shields.io/github/license/nuxt-modules/icon.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://github.com/nuxt-modules/icon/blob/main/LICENSE

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
