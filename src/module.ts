import { defineNuxtModule, createResolver, addComponent } from '@nuxt/kit'

export interface ModuleOptions {}

declare module '@nuxt/schema' {
  interface AppConfig {
    /** nuxt-icon configuration */
    nuxtIcon: {
      /** default size */
      size: string
    }
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-icon',
    configKey: 'icon',
    compatibility: {
      nuxt: '^3.0.0-rc.9'
    }
  },
  defaults: {},
  setup (_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    addComponent({
      name: 'Icon',
      global: true,
      filePath: resolve('./runtime/Icon.vue')
    })
  }
})
