> [!IMPORTANT]
> `nuxt-icon` package has been renamed to `@nuxt/icon`. Please install it and update your `nuxt.config.ts` to use the new package name.

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
- SSR friendly
- Support 200,000 open-source vector icons via [Iconify](https://iconify.design)
- Support both CSS mode / SVG mode
- Custom SVG support (via Vue component, or via local SVG files)

> [!NOTE]
> You are viewing the `v1.0` version of this module, which is a complete rewrite for a better developer experience and performance. If you are migrating from `v0.6`, please check [this PR](https://github.com/nuxt-modules/icon/pull/154) for the full list of changes.

## Setup ⛓️

Run the following command to add the module to your project:

```bash
npx nuxi module add icon
```

That's it, you can now use the `<Icon />` in your components!

✨ If you are using VS Code, you can use the [Iconify IntelliSense](https://marketplace.visualstudio.com/items?itemName=antfu.iconify) extension by [@antfu](https://github.com/antfu)

## Usage 👌

**Props:**
- `name` (required): icon name or global component name
- `size`: icon size (default: `1em`)
- `mode`: icon rendering mode (`svg` or `css`, default: `css`)

**Attributes**:

When using an icon from Iconify, an `<span>` or `<svg>` will be created based on the rendering mode, you can give [all the attributes](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute) of the native element.

```html
<Icon name="uil:github" color="black" />
```

### Iconify dataset

You can use any name from the https://icones.js.org collection:

```html
<Icon name="uil:github" />
```

It supports the `i-` prefix (for example, `i-uil-github`).

It's highly recommended to install the icon data locally with 

```bash
npm i -D @iconify-json/collection-name
```

For example, to use the `uil:github` icon, install it's collection with `@iconify-json/uil`. This way the icons can be served locally or from your serverless functions, which is faster and more reliable on both SSR and client-side.

### Vue component

When the `name` matches a global registered component, it will be rendered as that component (in this case `mode` will be ignored):

```html
<Icon name="MyComponent" />
```

Note that `MyComponent` needs to be inside `components/global/` folder (see [example](https://github.com/nuxt-modules/icon/blob/main/playground/components/global/NuxtIcon.vue)).

### Custom Local Collections

You can use local SVG files to create a custom Iconify collection.

For example, place your icons' SVG files under a folder on your choice, for example `./assets/my-icons`:

```bash
assets/my-icons
├── foo.svg
├── bar-outline.svg
```

In your `nuxt.config.ts`, add an item in `icon.customCollections`:

```ts
export default defineNuxtConfig({
  modules: [
    'nuxt-icon'
  ],
  icon: {
    customCollections: [
      {
        prefix: 'my-icon',
        dir: './assets/my-icons'
      },
    ],
  },
})
```

Then you can use the icons like this:

```vue
<template>
  <Icon name="my-icon:foo" />
  <Icon name="my-icon:bar-outline" />
</template>
```

## Configuration ⚙️

To update the default size (`1em`) of the `<Icon />`, create an `app.config.ts` with the `icon.size` property.

Update the default class (`.icon`) of the `<Icon />` with the `icon.class` property, for a headless Icon, set `icon`.class: ''`.

You can also define aliases to make swapping out icons easier by leveraging the `icon.aliases` property.

```ts
// app.config.ts
export default defineAppConfig({
  icon: {
    size: '24px', // default <Icon> size applied
    class: 'icon', // default <Icon> class applied
    mode: 'css', // default <Icon> mode applied
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

By default, this module will create a server endpoint `/api/_nuxt_icon/:collection` to serve the icons from your local server bundle. When requesting an icon that does not exist in the local bundle, it will fallback to requesting [the official Iconify API](https://api.iconify.design). You can disable the fallback by setting `icon.fallbackToApi` to `false`, or set up [your own Iconify API](https://iconify.design/docs/api/hosting.html) and update `icon.iconifyApiEndpoint` to your own API endpoint.

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
