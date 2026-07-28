import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'

const port = 34615
const origin = `http://127.0.0.1:${port}`
const server = spawn(process.execPath, ['.output/server/index.mjs'], {
  cwd: import.meta.dirname,
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
      throw new Error(`Nuxt 5 server exited with code ${server.exitCode}`)
    }
    const response = await fetch(origin).catch(() => null)
    if (response?.ok) return
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error('Nuxt 5 server did not start')
}

try {
  await waitForServer()

  const bundled = await fetch(`${origin}/api/_nuxt_icon/ph.json?icons=acorn-bold`)
  assert.equal(bundled.status, 200)
  assert.ok((await bundled.json()).icons['acorn-bold'])

  const remote = await fetch(`${origin}/api/_nuxt_icon/remote.json?icons=remote`)
  assert.equal(remote.status, 200)
  assert.ok((await remote.json()).icons.remote)
}
finally {
  server.kill()
  if (server.exitCode === null) {
    await new Promise(resolve => server.once('exit', resolve))
  }
}
