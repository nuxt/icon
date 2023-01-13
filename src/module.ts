import {
  defineNuxtModule,
  createResolver,
  addComponent,
  installModule,
} from '@nuxt/kit'

export interface ModuleOptions {}

// Learn how to create a Nuxt module on https://nuxt.com/docs/guide/going-further/modules/
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-icon',
    configKey: 'icon',
    compatibility: {
      nuxt: '^3.0.0-rc.9',
    },
  },
  defaults: {},
  setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // Define types for the app.config compatible with Nuxt Studio
    nuxt.hook('schema:extend', (schemas) => {
      schemas.push({
        nuxtIcon: {
          $schema: {
            description: 'Nuxt Icon',
          },
          size: {
            $default: '',
            $schema: {
              description: 'Default size',
              tags: ['@studio-icon material-symbols:format-size-rounded'],
            },
          },
          class: {
            $default: '',
            $schema: {
              description: 'Default class',
              tags: ['@studio-icon material-symbols:css'],
            },
          },
          aliases: {
            $default: {},
            $schema: {
              description: 'Aliases',
              tags: ['@studio-icon material-symbols:star-rounded'],
              tsType: '{ [alias: string]: string }',
            },
          },
        },
      })
    })

    installModule('nuxt-config-schema')

    addComponent({
      name: 'Icon',
      global: true,
      filePath: resolve('./runtime/Icon.vue'),
    })
  },
})
