import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { setup, useTestContext } from '@nuxt/test-utils/e2e'

describe('Nitro 3 server bundle', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/nitro3', import.meta.url)),
    build: true,
    server: false,
    browser: false,
  })

  // Requests to a server started inside the repo would still resolve the workspace node_modules,
  // so check that the externalized icon JSON was traced into the output instead.
  it('traces externalized icon JSON into the server output', () => {
    const outputDir = useTestContext().nuxt!.options.nitro.output!.dir!
    expect(existsSync(join(outputDir, 'server/node_modules/@iconify-json/ph/icons.json'))).toBe(true)
  })
})
