import { createResolver } from '@nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  app: {
    head: {
      title: 'Nuxt Layer Icon Playground',
      meta: [
        { name: 'description', content: 'The <Icon> component, supporting Iconify, Emojis and custom components.' },
      ],
    },
  },
  icon: {
    customCollections: [
      {
        prefix: 'layer',
        dir: resolve('./icons'),
      },
    ],
  },
})
