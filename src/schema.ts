import type { SchemaDefinition } from 'untyped'

export const schema = {
  $schema: {
    title: 'Nuxt Icon',
    description: 'Configure Nuxt Icon module preferences.',
    tags: ['@studioIcon material-symbols:star'],
  },
  size: {
    $default: undefined,
    $schema: {
      title: 'Icon Size',
      description: 'Set the default icon size.',
      tags: ['@studioIcon material-symbols:format-size-rounded'],
      tsType: 'string | undefined',
    },
  },
  class: {
    $default: '',
    $schema: {
      title: 'CSS Class',
      description: 'Set the default CSS class.',
      tags: ['@studioIcon material-symbols:css'],
    },
  },
  attrs: {
    $default: {
      'aria-hidden': true,
    },
    $schema: {
      title: 'Default Attributes',
      description: [
        'Attributes applied to every icon component.',
        '',
        '@default { "aria-hidden": true }',
      ].join('\n'),
      tags: ['@studioIcon material-symbols:settings'],
      tsType: 'Record<string, string | number | boolean>',
    },
  },
  mode: {
    $default: 'css',
    $schema: {
      title: 'Default Rendering Mode',
      description: 'Set the default rendering mode for the icon component',
      enum: ['css', 'svg'],
      tags: ['@studioIcon material-symbols:move-down-rounded'],
    },
  },
  aliases: {
    $default: {},
    $schema: {
      title: 'Icon aliases',
      description: 'Define Icon aliases to update them easily without code changes.',
      tags: ['@studioIcon material-symbols:star-rounded'],
      tsType: '{ [alias: string]: string }',
    },
  },
  cssSelectorPrefix: {
    $default: 'i-',
    $schema: {
      title: 'CSS Selector Prefix',
      description: 'Set the default CSS selector prefix.',
      tags: ['@studioIcon material-symbols:format-textdirection-l-to-r'],
    },
  },
  cssLayer: {
    $default: undefined,
    $schema: {
      title: 'CSS Layer Name',
      description: 'Set the default CSS `@layer` name.',
      tags: ['@studioIcon material-symbols:layers'],
      tsType: 'string | undefined',
    },
  },
  cssWherePseudo: {
    $default: true,
    $schema: {
      title: 'Use CSS `:where()` Pseudo Selector',
      description: 'Use CSS `:where()` pseudo selector to reduce specificity.',
      tags: ['@studioIcon material-symbols:low-priority'],
    },
  },
  collections: {
    $default: null,
    $schema: {
      title: 'Icon Collections',
      description: [
        'List of known icon collections name. Used to resolve collection name ambiguity.',
        'e.g. `simple-icons-github` -> `simple-icons:github` instead of `simple:icons-github`',
        '',
        'When not provided, will use the full Iconify collection list.',
      ].join('\n'),
      tags: ['@studioIcon material-symbols:format-list-bulleted'],
      tsType: 'string[] | null',
    },
  },
  customCollections: {
    $default: null,
    $schema: {
      title: 'Custom Icon Collections',
      tags: ['@studioIcon material-symbols:format-list-bulleted'],
      tsType: 'string[] | null',
    },
  },
  generateLocalSVGTypes: {
    $default: false,
    $schema: {
      type: 'boolean',
      description: 'Enable type generation for local custom SVG collections',
    },
  },
  provider: {
    $default: undefined,
    $schema: {
      title: 'Icon Provider',
      description: [
        'Provider to use for fetching icons',
        '',
        '- `server` - Fetch icons with a server handler',
        '- `iconify` - Fetch icons with Iconify API, purely client-side',
        '',
        '`server` by default; `iconify` when `ssr: false`',
      ].join('\n'),
      enum: ['server', 'iconify'],
      tags: ['@studioIcon material-symbols:cloud'],
      type: '"server" | "iconify" | undefined',
    },
  },
  iconifyApiEndpoint: {
    $default: 'https://api.iconify.design',
    $schema: {
      title: 'Iconify API Endpoint URL',
      description: 'Define a custom Iconify API endpoint URL. Useful if you want to use a self-hosted Iconify API. Learn more: https://iconify.design/docs/api.',
      tags: ['@studioIcon material-symbols:api'],
    },
  },
  fallbackToApi: {
    $default: true,
    $schema: {
      title: 'Fallback to Iconify API',
      description: 'Fallback to Iconify API if server provider fails to found the collection.',
      tags: ['@studioIcon material-symbols:public'],
      enum: [true, false, 'server-only', 'client-only'],
      type: 'boolean | "server-only" | "client-only"',
    },
  },
  localApiEndpoint: {
    $default: '/api/_nuxt_icon',
    $schema: {
      title: 'Local API Endpoint Path',
      description: 'Define a custom path for the local API endpoint.',
      tags: ['@studioIcon material-symbols:api'],
    },
  },
  fetchTimeout: {
    $default: 1500,
    $schema: {
      title: 'Fetch Timeout',
      description: 'Set the timeout for fetching icons.',
      tags: ['@studioIcon material-symbols:timer'],
    },
  },
  customize: {
    $default: undefined,
    $schema: {
      title: 'Customize callback',
      description: 'Customize icon content (replace stroke-width, colors, etc...).',
      tags: ['@studioIcon material-symbols:edit'],
      type: 'IconifyIconCustomizeCallback',
    },
  },
} satisfies SchemaDefinition
