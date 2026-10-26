import { $fetch } from '@nuxt/test-utils/e2e'

/**
 * Fetch the client JS a page loads before hydration: entry scripts,
 * modulepreloaded chunks and everything they import statically.
 */
export async function getCriticalJS(html: string): Promise<Map<string, string>> {
  const chunks = new Map<string, string>()
  const queue = [...html.matchAll(/<script[^>]+src="([^"]+)"|<link(?=[^>]+rel="modulepreload")[^>]+href="([^"]+)"/g)]
    .map(m => (m[1] || m[2])!)
  while (queue.length) {
    const url = queue.pop()!
    if (chunks.has(url))
      continue
    const code = await $fetch<string>(url, { responseType: 'text' })
    chunks.set(url, code)
    for (const [, path] of code.matchAll(/(?:import|from)\s*["'](\.\/[^"']+\.js)["']/g))
      queue.push(new URL(path!, new URL(url, 'http://localhost')).pathname)
  }
  return chunks
}
