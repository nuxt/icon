<!-- [![@nuxtjs/strapi](./docs/public/cover.jpg)](https://strapi.nuxtjs.org) -->

# Nuxt Icon

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions CI][github-actions-ci-src]][github-actions-ci-href]
[![License][license-src]][license-href]

> Icon module for [Nuxt](https://v3.nuxtjs.org).

- [✨ &nbsp;Release Notes](https://github.com/Atinux/nuxt-icon/releases)
- [🏀 &nbsp;Online playground](https://stackblitz.com/edit/nuxt-icon-playground?file=app.vue)

## Features

- Nuxt 3 ready
- Support 100,000 open source vector icons via [Iconify](https://iconify.design)
- Emoji Support
- Custom SVG support (via Vue component)

## Setup

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

## Usage

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

## Contributing

1. Clone this repository
2. Install dependencies using `yarn install` or `npm install`
3. Run `npm run dev:prepare` to generate type stubs.
4. Use `npm run dev` to start [playground](./playground) in development mode.

## License

[MIT License](./LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-icon/latest.svg
[npm-version-href]: https://npmjs.com/package/nuxt-icon

[npm-downloads-src]: https://img.shields.io/npm/dt/nuxt-icon.svg
[npm-downloads-href]: https://npmjs.com/package/nuxt-icon

[github-actions-ci-src]: https://github.com/Atinux/nuxt-icon/workflows/ci/badge.svg
[github-actions-ci-href]: https://github.com/AtinuxZ/nuxt-icon/actions?query=workflow%3Aci

[license-src]: https://img.shields.io/npm/l/nuxt-icon.svg
[license-href]: https://npmjs.com/package/nuxt-icon
