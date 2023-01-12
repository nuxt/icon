import { defineNuxtModule, createResolver, addComponent } from '@nuxt/kit'

export interface ModuleOptions {}

declare module '@nuxt/schema' {
  interface AppConfigInput {
    /** nuxt-icon configuration */
    nuxtIcon?: {
      /** Default Icon size */
      size?: string,
      /** Default Icon class */
      class?: string,
      /** Icon name aliases */
      aliases?: { [alias: string]: string }
    }
  }
}

// Learn how to create a Nuxt module on https://nuxt.com/docs/guide/going-further/modules/
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-icon',
    configKey: 'icon',
    compatibility: {
      nuxt: '^3.0.0-rc.9'
    }
  },
  defaults: {},
  setup () {
    const { resolve } = createResolver(import.meta.url)

    addComponent({
      name: 'Icon',
      global: true,
      filePath: resolve('./runtime/Icon.vue')
    })
  }
})
