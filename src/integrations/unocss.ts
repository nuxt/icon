/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Nuxt } from '@nuxt/schema'
import { addVitePlugin } from '@nuxt/kit'
import type { ModuleOptions } from '../types'

/**
 * This integration extracts the known CSS classes from UnoCSS and adds them to the serverKnownCssClasses
 * So Nuxt Icon can skip fetching icons for the icons that are already handled by UnoCSS
 */
export function unocssIntegration(nuxt: Nuxt, options: ModuleOptions) {
  let uno: InstanceType<typeof import('@unocss/core')['UnoGenerator']> | undefined

  function getKnownIconClasses() {
    // @ts-expect-error private API
    const cache = uno?._cache as Map<string, unknown>
    if (cache)
      return Array.from(cache.entries())
        .filter(([key, value]) => value && key.startsWith(options.cssSelectorPrefix || 'i-'))
        .map(([key]) => key)
    return []
  }

  // Search for the UnoCSS API instance from Vite's plugins
  nuxt.hook('vite:configResolved', (config, { isClient }) => {
    if (!isClient)
      return
    uno = (config.plugins?.flat().find(p => p && 'name' in p && p.name === 'unocss:api') as any)?.api?.getContext?.()?.uno
  })

  // For build, add a Vite plugin to extract the known CSS classes after the client build but before the server build
  if (!nuxt.options.dev) {
    addVitePlugin(
      {
        name: 'nuxt-icon:client-build-end',
        generateBundle() {
          if (uno) {
            options.serverKnownCssClasses ||= []
            options.serverKnownCssClasses.push(...getKnownIconClasses())
          }
        },
      },
      { client: true, server: false },
    )
  }

  // In dev, we proxy the nitro runtime to use a getter for serverKnownCssClasses and get the lastest known classes
  if (nuxt.options.dev) {
    nuxt.hook('nitro:init', async (_nitro) => {
      _nitro.options.runtimeConfig.icon ||= {} as any
      Object.defineProperty(_nitro.options.runtimeConfig.icon, 'serverKnownCssClasses', {
        get() {
          return [
            ...options.serverKnownCssClasses || [],
            ...getKnownIconClasses(),
          ]
        },
      })
    })
  }
}
