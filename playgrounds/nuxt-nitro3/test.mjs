import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { cp, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const port = 34616
const origin = `http://127.0.0.1:${port}`
const fetchWithTimeout = (url, timeout = 5_000) => fetch(url, {
  signal: AbortSignal.timeout(timeout),
})

const outputDir = await mkdtemp(join(tmpdir(), 'nuxt-icon-nitro3-'))
await cp(join(import.meta.dirname, '.output'), outputDir, { recursive: true })

const server = spawn(process.execPath, [join(outputDir, 'server/index.mjs')], {
  cwd: outputDir,
  env: {
    ...process.env,
    HOST: '127.0.0.1',
    PORT: String(port),
  },
  stdio: 'inherit',
})

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt++) {
    if (server.exitCode !== null) {
      throw new Error(`Nuxt server exited with code ${server.exitCode}`)
    }
    const response = await fetchWithTimeout(origin, 1_000).catch(() => null)
    if (response?.ok) return
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error('Nuxt server did not start')
}

try {
  await waitForServer()

  const page = await fetchWithTimeout(origin)
  assert.equal(page.status, 200)
  assert.match(await page.text(), /class="iconify i-ph:acorn-bold"/)

  const bundled = await fetchWithTimeout(`${origin}/api/_nuxt_icon/ph.json?icons=acorn-bold`)
  assert.equal(bundled.status, 200)
  const bundledData = await bundled.json()
  assert.equal(bundledData.prefix, 'ph')
  assert.ok(bundledData.icons['acorn-bold'])
}
finally {
  server.kill()
  if (server.exitCode === null) {
    await new Promise(resolve => server.once('exit', resolve))
  }
  await rm(outputDir, { recursive: true, force: true })
}
