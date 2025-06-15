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


<details>
<summary>Manual Setup</summary>

You can install the module manually with:

```bash
npm i -D @nuxt/icon
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

## Usage 👌

**Props:**
- `name` (required): icon name or global component name
- `size`: icon size (default: `1em`)
- `mode`: icon rendering mode (`svg` or `css`, default: `css`)

**Attributes**:

When using an icon from Iconify, a `<span>` or `<svg>` will be created based on the rendering mode, you can give [all the attributes](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute) of the native element.

```html
<Icon name="uil:github" style="color: black" />
```

**TailwindCSS v4**:

When using TailwindCSS v4 with the `css` mode, you should configure the `cssLayer` in Nuxt's app config:

```ts
// ~/app.config.ts
export default defineAppConfig({
  icon: {
    mode: 'css',
    cssLayer: 'base'
  }
})
```

### Iconify Dataset

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

> [!NOTE]
> You may also know you can install `@iconify/json` package to include all iconify icons. This is not recommended because it will increase your server bundle size and building performance. If you choose to do so, we'd recommend to explicitly specify the collection names you need:
>
> ```ts
> export default defineNuxtConfig({
>   modules: ['@nuxt/icon'],
>   icon: {
>     serverBundle: {
>       collections: ['uil', 'mdi'] // <!--- this
>     }
>   }
> })
> ```

### Vue Component

When the `name` matches a global registered component, it will be rendered as that component (in this case `mode` will be ignored):

```html
<Icon name="MyComponent" />
```

Note that `MyComponent` needs to be inside `components/global/` folder (see [example](https://github.com/nuxt-modules/icon/blob/main/playground/components/global/NuxtLogo.vue)).

> [!TIP]
> You can also change the component name with:
>
> ```ts
> export default defineNuxtConfig({
>   icon: {
>     componentName: 'NuxtIcon'
>   }
> })
> ```

### Custom Local Collections

You can use local SVG files to create a custom Iconify collection.

For example, place your icons' SVG files under a folder of your choice, for example, `./assets/my-icons`:

```bash
assets/my-icons
├── foo.svg
├── bar-outline.svg
```

In your `nuxt.config.ts`, add an item in `icon.customCollections`:

```ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/icon'
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

> [!NOTE]
> If you are running on Nuxt 4 with the new `app` directory, the assets directory is `'./app/assets/*'` instead of `'./assets/*'`.

Then you can use the icons like this:

```vue
<template>
  <Icon name="my-icon:foo" />
  <Icon name="my-icon:bar-outline" />
</template>
```

You can also pass a full custom `IconifyJSON` object:

```ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/icon'
  ],
  icon: {
    customCollections: [
      {
        prefix: 'paid-icons',
        icons: {
          'nuxt': { body: '<path d="M281.44 ... />' },
        },
        width: 512,
        height: 512,
      }
    ],
  },
})
```

Note that custom local collections require you to have a server to serve the API. When setting `ssr: false`, or when generating a static app using `nuxt generate` (which is equivalent to ssr: false), the provider will default to the Iconify API (which does not have your custom icons). If you want to build a SPA with server endpoints, you can explicitly set `provider: 'server'`:

```ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/icon'
  ],
  ssr: false,
  icon: {
    provider: 'server', // <-- this
    customCollections: [
      {
        prefix: 'my-icon',
        dir: './assets/my-icons'
      },
    ],
  },
})
```

Or if you want to disable the dynamic icon fetching completely and only use icons from the [client bundle](#client-bundle), you can set `provider: 'none'`:

```ts
export default defineNuxtConfig({
  icon: {
    provider: 'none',
    clientBundle: {
      scan: true,
      // ...or other bundle options
    },
  }
})
```

### Case Sensitive Custom Collections

Before `v1.10`, due to the limitation of Iconify's previous convention, all custom icons were normalized to `kebab-case` with a warning. Thanks to the updates on Iconify side, starting from `v1.10`, you can opt-in to use case-sensitive custom collections and by pass the normalization.

```ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/icon'
  ],
  icon: {
    customCollections: [
      {
        prefix: 'my-icon',
        dir: './assets/my-icons',
        normalizeIconName: false, // <-- this
      },
    ],
  },
})
```

Which enable to use `assets/my-icons/FooBar.svg` as `my-icon:FooBar`, for example.

`normalizeIconName` is default to `true` for backward compatibility, and will be flipped in the future major version. See [#265](https://github.com/nuxt/icon/issues/265) for more context.

### Icon Customization

To update the default size (`1em`) of the `<Icon />`, create an `app.config.ts` with the `icon.size` property.

Update the default class (`.icon`) of the `<Icon />` with the `icon.class` property, for a headless Icon, set `icon`.class: ''`.

You can also define aliases to make swapping out icons easier by leveraging the `icon.aliases` property.

> [!NOTE]
> Note it's `app.config.ts` and not `nuxt.config.ts` for runtime configs.

```ts
// app.config.ts
export default defineAppConfig({
  icon: {
    size: '24px', // default <Icon> size applied
    class: 'icon', // default <Icon> class applied
    mode: 'css', // default <Icon> mode applied
    aliases: {
      'nuxt': 'logos:nuxt-icon',
    },
    cssLayer: 'base' // set the css layer to inject to
  }
})
```

The icons will have the default size of `24px` and the `nuxt` icon will be available:

```html
<Icon name="nuxt" />
```

By default, this module will create a server endpoint `/api/_nuxt_icon/:collection` to serve the icons from your local server bundle (you can override the default path by setting `icon.localApiEndpoint` to your desired path). When requesting an icon that does not exist in the local bundle, it will fallback to requesting [the official Iconify API](https://api.iconify.design). You can disable the fallback by setting `icon.fallbackToApi` to `false`, or set up [your own Iconify API](https://iconify.design/docs/api/hosting.html) and update `icon.iconifyApiEndpoint` to your own API endpoint.

**Customizing Icons with the customize Option**

The customize option allows you to modify various aspects of the SVG icons used in your project. With this option, you can:

- Change Stroke Width
- Change Colors
- Change Animation Duration
- Change Opacity
- Add Extra Shapes

You have full control over SVG content with these customization options.

In a Component
You can define a customize function within a component to apply various modifications to your icons.

```vue
<script setup lang="ts">
// Define the customize function to modify SVG content
const customize = (content: string, name: string, prefix: string, provider: string) => {
  if (prefix !== 'tabler') return content // Ignore Prefix

  return content
    .replace(/stroke-width="[^"]*"/g, `stroke-width="2"`) // Change stroke width to 2
    .replace(/stroke="[^"]*"/g, `stroke="#FF5733"`) // Change stroke color to red
    .replace(/fill="[^"]*"/g, `fill="#FF5733"`) // Change fill color to red
    .replace(/animation-duration="[^"]*"/g, `animation-duration="1s"`) // Change animation duration to 1s (for animated icons)
    .replace(/opacity="[^"]*"/g, `opacity="0.8"`);// Change opacity to 0.8
}
</script>

<template>
  <Icon name="tabler:star" :customize="customize" />
</template>

<!-- You can also use `:customize="false"` to disabled the global customization function per-usage -->
```

In the App Configuration File:

Alternatively, you can apply these customizations globally in the `app.config.ts` file.
```ts
// app.config.ts
export default defineAppConfig({
  icon: {
    customize: (content: string, name: string, prefix: string, provider: string) => {
      // ...
    },
  }
})
```
With this configuration, all icons throughout your application will have these customizations applied consistently.

### Server Bundle

Since `@nuxt/icon` v1.0, we have introduced the server bundle concept to serve the icons from Nuxt server endpoints. This keeps the client bundle lean and able to load icons on-demand, while having all the dynamic features to use icons that might not be known at build time.

#### Server Bundle Mode: `local`

This mode will bundle the icon collections you have installed locally (like `@iconify-json/*`), into your server bundle as dynamic chunks. The collection data will be loaded on-demand, only when your client request icons from that collection.

#### Server Bundle Mode: `remote`

Introduced in `@nuxt/icon` v1.2, you can now use the `remote` server bundle to serve the icons from a remote CDN.

```ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/icon'
  ],
  icon: {
    serverBundle: 'remote',
  },
})
```

Or you can specify the remote provider:

```ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/icon'
  ],
  icon: {
    serverBundle: {
      remote: 'jsdelivr', // 'unpkg' or 'github-raw', or a custom function
    }
  },
})
```

Which will make server requests to `https://cdn.jsdelivr.net/npm/@iconify-json/ph/icons.json` to fetch the icons at runtime, instead of bundling them with your server.

Under the hood, instead of bundling `() => import('@iconify-json/ph/icons.json')` to your server bundle, it will now use something like `() => fetch('https://cdn.jsdelivr.net/npm/@iconify-json/ph/icons.json').then(res => res.json())`, where the collections are not inlined.

This would be useful when server bundle size is a concern, like in serverless or worker environments.

#### Server Bundle Mode: `auto`

This is the default option, where the module will pick between `local` and `remote` based your deployment environment. `local` will be preffered unless you are deploying to a serverless or worker environment, like Vercel Edge or Cloudflare Workers.

#### Externalize Icons JSON

By default, Nitro will bundle the icon collections you have installed locally (like `@iconify-json/*`), into your server bundle as dynamic chunks. When you have a large number of icons, this might make your bundling process slow and memory-intensive. You can change to externalize the icons JSON files by setting `icon.serverBundle.externalizeIconsJson` to `true`.

```ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/icon'
  ],
  icon: {
    serverBundle: {
      externalizeIconsJson: true,
    }
  },
})
```

Note that this will require your production Node.js server to be able to import JSON files (Note that as in Node.js v22, [JSON modules are still an experimental feature](https://nodejs.org/api/esm.html#json-modules)). In the final build, it will contain statements like `() => import('@iconify-json/ph/icons.json', { with: { type: 'json' } })`.

Also note that in some serverless environments, like Cloudflare Workers, where they don't have dynamic imports, they will always be inlined regardless of this option.

This option will be ignored when `icon.serverBundle.remote` is enabled.

#### Completely Disable Server Bundle

If you want to disable the server bundle completely, you can set `icon.serverBundle` to `false` and `provider` to `iconify`

```ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/icon'
  ],
  icon: {
    provider: 'iconify',
    serverBundle: false,
  },
})
```

This will make requests to Iconify API every time the client requests an icon. We do not recommend doing so unless the other options are not feasible.

### Client Bundle

For icons that you know you are going to use frequently, you can bundle them with your client bundle to avoid network requests.

```ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/icon'
  ],
  icon: {
    clientBundle: {
      // list of icons to include in the client bundle
      icons: [
        'uil:github',
        'logos:vitejs'
      ],

      // scan all components in the project and include icons 
      scan: true,

      // include all custom collections in the client bundle
      includeCustomCollections: true, 

      // guard for uncompressed bundle size, will fail the build if exceeds
      sizeLimitKb: 256,
    },
  },
})
```

`includeCustomCollections` will include all the custom collections you have defined in `icon.customCollections` in the client bundle. It's disabled by default but will automatically enable when `ssr: false` is set.

#### Scan Components

When `scan` is enabled, the module will scan all the components in your project and include the icons used in the client bundle. This would significantly reduce the number of network requests needed for statically known icons, but might also increase the client bundle size depending on the number of icons used in your project.

You can also fine-tune tine scanning targets like:

```ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/icon'
  ],
  icon: {
    clientBundle: {
      scan: {
        // note that when you specify those values, the default behavior will be overridden
        globInclude: ['components/**/*.vue', /* ... */],
        globExclude: ['node_modules', 'dist', /* ... */],
      },
    },
  },
})
```

> [!TIP]
> Scanning is relying on static analysis, which means only literal usages will be detected. Avoid constructing the icon name dynamically whenever possible.
>
> ```vue
> <template>
>   <!-- Avoid this -->
>   <Icon :name="`carbon:${dark ? 'moon' : 'sun'}`" />
>
>   <!-- Prefer this -->
>   <Icon :name="dark ? 'carbon:moon' : 'carbon:sun'" />
> </template>
> ```

### Render Function

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
[npm-version-src]: https://img.shields.io/npm/v/@nuxt/icon/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@nuxt/icon

[npm-downloads-src]: https://img.shields.io/npm/dm/@nuxt/icon.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@nuxt/icon

[license-src]: https://img.shields.io/github/license/nuxt-modules/icon.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://github.com/nuxt-modules/icon/blob/main/LICENSE

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
