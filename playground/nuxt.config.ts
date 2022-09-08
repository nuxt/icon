import { defineNuxtConfig } from 'nuxt'
import nuxtIcon from '../src/module'

export default defineNuxtConfig({
  typescript: { typeCheck: true, strict: true },
  modules: [
    nuxtIcon
  ]
})
