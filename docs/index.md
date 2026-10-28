---
title: Nuxt Icon
description: 'Add 200,000+ ready to use icons to your Nuxt application.'
navigation:
  title: Quick Start
---

## Features

- SSR friendly
- Support 200,000 open-source vector icons via [Iconify](https://iconify.design)
- Support both CSS mode / SVG mode
- Custom SVG support (via Vue component, or via local SVG files)

## Installation

Run the following command to add the module to your project, with the [`nuxt add`](/docs/api/commands/add) command:

```bash
npx nuxt add icon
```

That's it, you can now use the `<Icon />` in your components, see [Usage](/modules/icon/usage).

✨ If you are using VS Code, you can use the [Iconify IntelliSense](https://marketplace.visualstudio.com/items?itemName=antfu.iconify) extension by [@antfu](https://github.com/antfu)


<details>
<summary>Manual Setup</summary>

You can install the module manually with:

```bash
npm i @nuxt/icon
```

Update your `nuxt.config.ts`

```ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/icon'
  ]
})
```

If you have the legacy module `nuxt-icon` installed, you might want to remove it from the `modules` list.

</details>

## Vite (without Nuxt)

If you are building a plain Vue app with Vite (for example when using [Nuxt UI's Vue integration](https://ui.nuxt.com/docs/getting-started/integrations/vue)), there is no Nuxt server to serve icons from, and `@iconify/vue` would fetch icons from the Iconify API at runtime. To render icons offline without network requests, `@nuxt/icon` ships a standalone Vite plugin that pre-bundles the icons you use into the client build.

Install it with `@iconify/vue`, which the registration module imports, and the icon collections you use:

```bash
npm i @nuxt/icon @iconify/vue
npm i -D @iconify-json/uil @iconify-json/heroicons
```

Then add the plugin to your Vite config:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { NuxtIconBundle } from '@nuxt/icon/vite'

export default defineConfig({
  plugins: [
    NuxtIconBundle({
      // Explicitly pre-bundle known icons (hard-fails the build when missing locally)
      icons: ['uil:github', 'heroicons:home'],
      // Scanning your source files for icon usages is enabled by default.
      // It reads .vue, .jsx, .tsx, Markdown and YAML files: list icons only named in .js/.ts files in `icons`.
      scan: true,
    }),
  ],
})
```

Then register the bundled icons once in your entry file:

```ts
// main.ts
import 'virtual:nuxt-icon-bundle/register'
```

Add the type shims for the virtual modules to the `types` of your `tsconfig.json`, next to the ones you already list:

```json
{
  "compilerOptions": {
    "types": ["vite/client", "@nuxt/icon/client"]
  }
}
```

The plugin accepts the same options as `icon.clientBundle` (`icons`, `scan`, `sizeLimitKb`), plus `customCollections` — with two differences in defaults: `scan` is enabled by default (bundling is the whole point of the plugin), and `includeCustomCollections` is always enabled by default (there is no server provider to fall back to).

For library and framework authors integrating icons themselves: `virtual:nuxt-icon-bundle` exports `init(addIcon)` so you can register the bundled data on your own copy of `@iconify/vue` (or any compatible store), and the underlying primitives (`IconUsageScanner`, `resolveBundleIcons`, `generateClientBundleCode`, ...) are exported from `@nuxt/icon/utils`.

For server-side rendering, `@iconify/vue` has its own requirements: see its [documentation](https://iconify.design/docs/icon-components/vue/).

See [`playgrounds/vite/`](https://github.com/nuxt/icon/tree/main/playgrounds/vite) for a working example (`pnpm play:vite` to run it locally).
