import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/vite',
    'src/utils',
  ],
  externals: [
    'vite',
  ],
})
