// @vitest-environment nuxt
import { it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { _api } from '@iconify/vue'
import { Icon } from '#components'

it('keeps a late icon response under the name it was requested for', async () => {
  // Hold every icon request until the test answers it
  const pending = new Map<string, () => void>()
  _api.setFetch(((input: string) => {
    const url = new URL(input, 'http://localhost')
    const prefix = url.pathname.split('/').pop()!.replace('.json', '')
    const name = url.searchParams.get('icons')!
    return new Promise<Response>((resolve) => {
      // The body carries its own name, to tell which icon a CSS rule renders
      pending.set(name, () => resolve(new Response(
        JSON.stringify({ prefix, width: 24, height: 24, icons: { [name]: { body: `<path id="body-${name}" d="M0,0h1"/>` } } }),
        { headers: { 'content-type': 'application/json' } },
      )))
    })
  }) as typeof fetch)

  const component = await mountSuspended(Icon, { props: { name: 'race:first', mode: 'css' } })
  await vi.waitFor(() => expect(pending.has('first')).toBe(true))
  await component.setProps({ name: 'race:second' })
  await vi.waitFor(() => expect(pending.has('second')).toBe(true))

  // The request for the previous name lands first, after the name changed
  pending.get('first')!()
  await new Promise(resolve => setTimeout(resolve, 50))
  pending.get('second')!()

  const cssFor = (name: string) => [...document.head.querySelectorAll('style')]
    .map(style => style.textContent || '')
    .filter(css => css.includes(`.i-race\\:${name}`))
    .join('\n')

  await vi.waitFor(() => expect(cssFor('second')).toContain('body-second'))
  expect(cssFor('second')).not.toContain('body-first')
  expect(cssFor('first')).toContain('body-first')
  expect(component.html()).toContain('i-race:second')
})
