![Nuxt Icon](https://github.com/nuxt-modules/icon/assets/904724/ae673805-06ad-4c05-820e-a8445c7224ce)

# Nuxt Icon

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Add [200,000+ ready to use icons](https://icones.js.org) to your [Nuxt](https://nuxt.com) application, based on [Iconify](https://iconify.design).

- [📖 &nbsp;Documentation](https://nuxt.com/modules/icon)
- [✨ &nbsp;Release Notes](https://github.com/nuxt/icon/releases)
- [🏀 &nbsp;Online playground](https://stackblitz.com/edit/nuxt-icon-playground?file=app.vue)

## Features

- SSR friendly
- 200,000+ open-source vector icons via [Iconify](https://iconify.design)
- CSS mode and SVG mode
- Custom icons, from Vue components or local SVG files
- Client bundles for offline icons, and a standalone Vite plugin for Vue apps without Nuxt

## Quick Setup

Add the module to your Nuxt project:

```bash
npx nuxt add icon
```

Then use the `<Icon>` component with any icon name from [Icônes](https://icones.js.org):

```vue
<template>
  <Icon name="uil:github" />
</template>
```

Read the [documentation](https://nuxt.com/modules/icon) for [usage](https://nuxt.com/modules/icon/usage), [configuration](https://nuxt.com/modules/icon/configuration), [server and client bundles](https://nuxt.com/modules/icon/bundles), [icon customization](https://nuxt.com/modules/icon/customization), [custom collections](https://nuxt.com/modules/icon/custom-collections) and [testing](https://nuxt.com/modules/icon/testing).

## Contributing

1. Clone this repository
2. Install dependencies using `pnpm install` (install `pnpm` with `corepack enable`, [learn more](https://pnpm.io/installation#using-corepack))
3. Run `npm run dev:prepare` to generate type stubs.
4. Use `npm run dev` to start [playground](https://github.com/nuxt/icon/tree/main/playgrounds/nuxt) in development mode.

## Credits

- [@benjamincanac](https://github.com/benjamincanac) for the initial version
- [@cyberalien](https://github.com/cyberalien) for making [Iconify](https://github.com/iconify/iconify)

## License

[MIT License](https://github.com/nuxt/icon/blob/main/LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@nuxt/icon/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@nuxt/icon

[npm-downloads-src]: https://img.shields.io/npm/dm/@nuxt/icon.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@nuxt/icon

[license-src]: https://img.shields.io/github/license/nuxt/icon.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://github.com/nuxt/icon/blob/main/LICENSE

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
