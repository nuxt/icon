import {
  defineNuxtModule,
  createResolver,
  addComponent,
  addTemplate
} from '@nuxt/kit'
import { addCustomTab } from '@nuxt/devtools-kit'
const iconifyCollections = require('@iconify/collections/collections.json')

export interface ModuleOptions {}

// Learn how to create a Nuxt module on https://nuxt.com/docs/guide/going-further/modules/
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-icon',
    configKey: 'icon',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  defaults: {},
  setup (_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // Define types for the app.config compatible with Nuxt Studio
    nuxt.hook('schema:extend', (schemas) => {
      schemas.push({
        appConfig: {
          nuxtIcon: {
            $schema: {
              title: 'Nuxt Icon',
              description: 'Configure Nuxt Icon module preferences.'
            },
            size: {
              $default: '1em',
              $schema: {
                title: 'Icon Size',
                description: 'Set the default icon size. Set to false to disable the sizing of icon in style.',
                tags: ['@studioIcon material-symbols:format-size-rounded'],
                tsType: 'string | false'
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
            aliases: {
              $default: {},
              $schema: {
                title: 'Icon aliases',
                description: 'Define Icon aliases to update them easily without code changes.',
                tags: [
                  '@studioIcon material-symbols:star-rounded'
                ],
                tsType: '{ [alias: string]: string }',
              },
            },
            iconifyApiOptions: {
              $schema: {
                  title: 'Iconify API Options',
                  description: 'Define preferences for Iconify API fetch.',
                  tags: [
                    '@studioIcon material-symbols:tv-options-input-settings'
                  ],
              url: {
                $default: 'https://api.iconify.design',
                $schema: {
                  title: 'Iconify API URL',
                  description: 'Define a custom Iconify API URL. Useful if you want to use a self-hosted Iconify API. Learn more: https://iconify.design/docs/api.',
                  tags: [
                    '@studioIcon material-symbols:api'
                  ],
                },
              },
              publicApiFallback: {
                $default: false,
                $schema: {
                  title: 'Public Iconify API fallback',
                  description: 'Define if the public Iconify API should be used as fallback.',
                  tags: [
                    '@studioIcon material-symbols:public'
                  ]
                },
              },
            },
          },
        },
      })
    })

    addComponent({
      name: 'Icon',
      global: true,
      filePath: resolve('./runtime/Icon.vue'),
    })
    addComponent({
      name: 'IconCSS',
      global: true,
      filePath: resolve('./runtime/IconCSS.vue'),
    })


    // Add Iconify collections & sort by longest first
    const iconCollections = Object.keys(iconifyCollections).sort((a, b) => b.length - a.length)
    const template = addTemplate({
      filename: 'icon-collections.mjs',
      getContents: () => `export default ${JSON.stringify(iconCollections)}`,
      write: true
    })
    // Add alias to `#icon-collections`
    nuxt.options.alias['#icon-collections'] = template.dst

    addCustomTab({
      name: 'icones',
      title: 'Icônes',
      icon: 'i-arcticons-iconeration',
      view: {
        type: 'iframe',
        src: 'https://icones.js.org'
      }
    })
  }
})
