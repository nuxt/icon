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
        // Relative to this layer, not to the app extending it
        prefix: 'layer',
        dir: './icons',
      },
    ],
  },
})
