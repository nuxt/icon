import { defineNuxtConfig } from 'nuxt'
import nuxtIcon from '../src/module'

export default defineNuxtConfig({
  typescript: { strict: true },
  modules: [
    nuxtIcon
  ]
})
