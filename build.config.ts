import { defineBuildConfig } from 'unbuild'

// TODO: address upstream in unbuild or nuxt/module-builder
export default defineBuildConfig({
  rollup: {
    esbuild: {
      target: 'esnext'
    },
  }
})
